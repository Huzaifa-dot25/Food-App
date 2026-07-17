using AutoMapper;
using BCrypt.Net;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.DTOs.Auth;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace FoodDelivery.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository    _userRepo;
    private readonly AppDbContext       _context;
    private readonly JwtTokenService    _jwt;
    private readonly IEmailService      _email;
    private readonly IFileStorageService _fileStorage;
    private readonly IMapper            _mapper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepo,
        AppDbContext context,
        JwtTokenService jwt,
        IEmailService email,
        IFileStorageService fileStorage,
        IMapper mapper,
        ILogger<AuthService> logger)
    {
        _userRepo    = userRepo;
        _context     = context;
        _jwt         = jwt;
        _email       = email;
        _fileStorage = fileStorage;
        _mapper      = mapper;
        _logger      = logger;
    }

    // ── Register ──────────────────────────────────────────────────────
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // 1. Check for duplicate email
        if (await _userRepo.EmailExistsAsync(request.Email))
            throw new Domain.Exceptions.ValidationException("Email",
                "An account with this email already exists.");

        // 2. Resolve role (only Customer/Owner/Rider allowed via register)
        var allowedRoles = new[] { "Customer", "Owner", "Rider" };
        var roleName     = allowedRoles.Contains(request.Role, StringComparer.OrdinalIgnoreCase)
            ? request.Role : "Customer";

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == roleName)
            ?? throw new NotFoundException("Role", roleName);

        // 3. Create user
        var user = new User
        {
            FirstName    = request.FirstName.Trim(),
            LastName     = request.LastName.Trim(),
            Email        = request.Email.ToLower().Trim(),
            PhoneNumber  = request.PhoneNumber.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12),
            Status       = UserStatus.Active
        };

        // 4. Generate & attach OTP for email verification
        var otp = GenerateOtp();
        user.OtpCode   = otp;
        user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);

        await _userRepo.AddAsync(user);
        await _context.SaveChangesAsync();

        // 5. Assign role
        _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        await _context.SaveChangesAsync();

        // 6. Send verification email (non-blocking on failure)
        await _email.SendOtpEmailAsync(user.Email, user.FirstName, otp);
        await _email.SendWelcomeEmailAsync(user.Email, user.FirstName);

        _logger.LogInformation("New user registered: {Email} as {Role}", user.Email, roleName);

        // 7. Issue tokens (user can use app immediately; features locked until verified)
        return await BuildAuthResponseAsync(user);
    }

    // ── Login ─────────────────────────────────────────────────────────
    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email)
            ?? throw new Domain.Exceptions.ValidationException("Email",
                "Invalid email or password.");

        if (user.Status == UserStatus.Suspended)
            throw new UnauthorizedException("Your account has been suspended. Contact support.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new Domain.Exceptions.ValidationException("Email",
                "Invalid email or password.");

        // Update FCM token if provided
        if (!string.IsNullOrWhiteSpace(request.FcmToken))
        {
            user.FcmToken = request.FcmToken;
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("User logged in: {Email}", user.Email);
        return await BuildAuthResponseAsync(user);
    }

    // ── Refresh Token ─────────────────────────────────────────────────
    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        // Hash the incoming token and look it up
        var tokenHash = _jwt.HashRefreshToken(refreshToken);

        var user = await _userRepo.GetByRefreshTokenAsync(tokenHash)
            ?? throw new UnauthorizedException("Invalid or expired refresh token.");

        if (user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            // Expired — revoke and force re-login
            user.RefreshToken       = null;
            user.RefreshTokenExpiry = null;
            await _context.SaveChangesAsync();
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        // Rotate refresh token
        return await BuildAuthResponseAsync(user);
    }

    // ── Logout ────────────────────────────────────────────────────────
    public async Task LogoutAsync(int userId)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        user.RefreshToken       = null;
        user.RefreshTokenExpiry = null;
        user.FcmToken           = null;
        await _context.SaveChangesAsync();

        _logger.LogInformation("User logged out: {UserId}", userId);
    }

    // ── Send OTP (resend verification) ────────────────────────────────
    public async Task SendOtpAsync(string email)
    {
        var user = await _userRepo.GetByEmailAsync(email)
            ?? throw new NotFoundException("User", email);

        if (user.IsEmailVerified)
            throw new DomainException("Email is already verified.");

        var otp = GenerateOtp();
        user.OtpCode   = otp;
        user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
        await _context.SaveChangesAsync();

        await _email.SendOtpEmailAsync(user.Email, user.FirstName, otp);
    }

    // ── Verify OTP ────────────────────────────────────────────────────
    public async Task VerifyOtpAsync(VerifyOtpRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email)
            ?? throw new NotFoundException("User", request.Email);

        if (user.OtpCode != request.OtpCode)
            throw new Domain.Exceptions.ValidationException("OtpCode", "Invalid OTP code.");

        if (user.OtpExpiry < DateTime.UtcNow)
            throw new Domain.Exceptions.ValidationException("OtpCode",
                "OTP has expired. Please request a new one.");

        user.IsEmailVerified = true;
        user.OtpCode         = null;
        user.OtpExpiry       = null;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Email verified for user: {Email}", user.Email);
    }

    // ── Forgot Password ───────────────────────────────────────────────
    public async Task SendPasswordResetOtpAsync(ForgotPasswordRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email);

        // Always return success to prevent email enumeration
        if (user is null) return;

        var otp = GenerateOtp();
        user.OtpCode   = otp;
        user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
        await _context.SaveChangesAsync();

        await _email.SendOtpEmailAsync(user.Email, user.FirstName, otp);
    }

    // ── Reset Password ────────────────────────────────────────────────
    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new Domain.Exceptions.ValidationException("ConfirmPassword",
                "Passwords do not match.");

        var user = await _userRepo.GetByEmailAsync(request.Email)
            ?? throw new NotFoundException("User", request.Email);

        if (user.OtpCode != request.OtpCode)
            throw new Domain.Exceptions.ValidationException("OtpCode", "Invalid OTP code.");

        if (user.OtpExpiry < DateTime.UtcNow)
            throw new Domain.Exceptions.ValidationException("OtpCode",
                "OTP has expired. Please request a new one.");

        user.PasswordHash    = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);
        user.OtpCode         = null;
        user.OtpExpiry       = null;
        // Revoke all refresh tokens on password reset
        user.RefreshToken       = null;
        user.RefreshTokenExpiry = null;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Password reset for user: {Email}", user.Email);
    }

    // ── Profile ───────────────────────────────────────────────────────
    public async Task<UserProfileDto> GetProfileAsync(int userId)
    {
        var user = await _userRepo.GetWithRolesAsync(userId)
            ?? throw new NotFoundException("User", userId);

        return _mapper.Map<UserProfileDto>(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _userRepo.GetWithRolesAsync(userId)
            ?? throw new NotFoundException("User", userId);

        user.FirstName   = request.FirstName.Trim();
        user.LastName    = request.LastName.Trim();
        user.PhoneNumber = request.PhoneNumber.Trim();
        await _context.SaveChangesAsync();

        return _mapper.Map<UserProfileDto>(user);
    }

    public async Task<string> UploadProfileImageAsync(int userId, Stream imageStream, string fileName)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        // Delete old image if present
        if (!string.IsNullOrWhiteSpace(user.ProfileImageUrl))
            await _fileStorage.DeleteAsync(user.ProfileImageUrl);

        var ext         = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = ext is ".jpg" or ".jpeg" ? "image/jpeg" : "image/png";
        var url         = await _fileStorage.UploadAsync(imageStream, fileName, contentType, "profiles");

        user.ProfileImageUrl = url;
        await _context.SaveChangesAsync();

        return url;
    }

    // ── Addresses ─────────────────────────────────────────────────────
    public async Task<IReadOnlyList<AddressDto>> GetAddressesAsync(int userId)
    {
        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IReadOnlyList<AddressDto>>(addresses);
    }

    public async Task<AddressDto> AddAddressAsync(int userId, CreateAddressRequest request)
    {
        // If this is the first address or marked default, clear existing default
        if (request.IsDefault)
            await ClearDefaultAddressAsync(userId);

        var address = _mapper.Map<Address>(request);
        address.UserId = userId;

        // Auto-set as default if it's the first address
        var count = await _context.Addresses.CountAsync(a => a.UserId == userId);
        if (count == 0) address.IsDefault = true;

        await _context.Addresses.AddAsync(address);
        await _context.SaveChangesAsync();

        return _mapper.Map<AddressDto>(address);
    }

    public async Task<AddressDto> UpdateAddressAsync(int userId, int addressId, CreateAddressRequest request)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId)
            ?? throw new NotFoundException("Address", addressId);

        if (request.IsDefault)
            await ClearDefaultAddressAsync(userId);

        _mapper.Map(request, address);
        await _context.SaveChangesAsync();

        return _mapper.Map<AddressDto>(address);
    }

    public async Task DeleteAddressAsync(int userId, int addressId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId)
            ?? throw new NotFoundException("Address", addressId);

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();

        // If deleted address was default, promote the most recent one
        if (address.IsDefault)
        {
            var next = await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync();

            if (next is not null)
            {
                next.IsDefault = true;
                await _context.SaveChangesAsync();
            }
        }
    }

    public async Task SetDefaultAddressAsync(int userId, int addressId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId)
            ?? throw new NotFoundException("Address", addressId);

        await ClearDefaultAddressAsync(userId);
        address.IsDefault = true;
        await _context.SaveChangesAsync();
    }

    // ── Private helpers ───────────────────────────────────────────────

    /// <summary>Build the full AuthResponse including new token pair.</summary>
    private async Task<AuthResponse> BuildAuthResponseAsync(User user)
    {
        // Load roles if not already loaded
        if (!user.UserRoles.Any())
        {
            user = await _userRepo.GetWithRolesAsync(user.Id)
                   ?? throw new NotFoundException("User", user.Id);
        }

        var roles        = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken  = _jwt.GenerateAccessToken(user, roles);
        var refreshToken = _jwt.GenerateRefreshToken();

        // Store hashed refresh token
        user.RefreshToken       = _jwt.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiry = _jwt.GetRefreshTokenExpiry();
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            UserId           = user.Id,
            FirstName        = user.FirstName,
            LastName         = user.LastName,
            Email            = user.Email,
            ProfileImageUrl  = user.ProfileImageUrl,
            Roles            = roles,
            AccessToken      = accessToken,
            RefreshToken     = refreshToken,     // Raw token returned to client
            AccessTokenExpiry = _jwt.GetAccessTokenExpiry()
        };
    }

    /// <summary>Generates a 6-digit numeric OTP.</summary>
    private static string GenerateOtp()
    {
        var bytes  = RandomNumberGenerator.GetBytes(4);
        var number = BitConverter.ToUInt32(bytes, 0) % 1_000_000;
        return number.ToString("D6");
    }

    private async Task ClearDefaultAddressAsync(int userId)
    {
        var current = await _context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ToListAsync();

        foreach (var a in current)
            a.IsDefault = false;
    }
}
