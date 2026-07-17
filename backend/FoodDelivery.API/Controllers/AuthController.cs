using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Auth;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
        => _authService = authService;

    // ── POST /api/auth/register ───────────────────────────────────────
    /// <summary>Register a new Customer, Owner or Rider account.</summary>
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return CreatedAtAction(nameof(GetProfile),
            ApiResponse<AuthResponse>.Ok(result, "Registration successful. Please verify your email."));
    }

    // ── POST /api/auth/login ──────────────────────────────────────────
    /// <summary>Login and receive a JWT access token + refresh token.</summary>
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Login successful."));
    }

    // ── POST /api/auth/refresh ────────────────────────────────────────
    /// <summary>Exchange a valid refresh token for a new token pair.</summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Token refreshed."));
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────
    /// <summary>Revoke the current refresh token and FCM token.</summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(200)]
    public async Task<IActionResult> Logout()
    {
        var userId = GetUserId();
        await _authService.LogoutAsync(userId);
        return Ok(ApiResponse.OkNoData("Logged out successfully."));
    }

    // ── POST /api/auth/send-otp ───────────────────────────────────────
    /// <summary>Resend email verification OTP.</summary>
    [HttpPost("send-otp")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> SendOtp([FromBody] ForgotPasswordRequest request)
    {
        await _authService.SendOtpAsync(request.Email);
        return Ok(ApiResponse.OkNoData("OTP sent to your email address."));
    }

    // ── POST /api/auth/verify-otp ─────────────────────────────────────
    /// <summary>Verify the 6-digit email OTP to activate the account.</summary>
    [HttpPost("verify-otp")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        await _authService.VerifyOtpAsync(request);
        return Ok(ApiResponse.OkNoData("Email verified successfully."));
    }

    // ── POST /api/auth/forgot-password ────────────────────────────────
    /// <summary>Request a password-reset OTP (sent to email).</summary>
    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.SendPasswordResetOtpAsync(request);
        // Always 200 to avoid email enumeration
        return Ok(ApiResponse.OkNoData(
            "If an account exists with that email, a reset code has been sent."));
    }

    // ── POST /api/auth/reset-password ─────────────────────────────────
    /// <summary>Reset password using the OTP received by email.</summary>
    [HttpPost("reset-password")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok(ApiResponse.OkNoData("Password reset successfully. Please log in."));
    }

    // ── GET /api/auth/profile ─────────────────────────────────────────
    /// <summary>Get the authenticated user's profile.</summary>
    [HttpGet("profile")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), 200)]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _authService.GetProfileAsync(GetUserId());
        return Ok(ApiResponse<UserProfileDto>.Ok(result));
    }

    // ── PUT /api/auth/profile ─────────────────────────────────────────
    /// <summary>Update name and phone number.</summary>
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), 200)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var result = await _authService.UpdateProfileAsync(GetUserId(), request);
        return Ok(ApiResponse<UserProfileDto>.Ok(result, "Profile updated."));
    }

    // ── POST /api/auth/profile/image ──────────────────────────────────
    /// <summary>Upload a profile picture (multipart/form-data).</summary>
    [HttpPost("profile/image")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided."));

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(ApiResponse<object>.Fail("Only JPEG, PNG and WebP images are allowed."));

        if (file.Length > 5 * 1024 * 1024) // 5 MB
            return BadRequest(ApiResponse<object>.Fail("Image must be smaller than 5 MB."));

        await using var stream = file.OpenReadStream();
        var url = await _authService.UploadProfileImageAsync(GetUserId(), stream, file.FileName);
        return Ok(ApiResponse<object>.Ok(new { imageUrl = url }, "Profile image updated."));
    }

    // ── GET /api/auth/addresses ───────────────────────────────────────
    [HttpGet("addresses")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AddressDto>>), 200)]
    public async Task<IActionResult> GetAddresses()
    {
        var result = await _authService.GetAddressesAsync(GetUserId());
        return Ok(ApiResponse<IReadOnlyList<AddressDto>>.Ok(result));
    }

    // ── POST /api/auth/addresses ──────────────────────────────────────
    [HttpPost("addresses")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<AddressDto>), 201)]
    public async Task<IActionResult> AddAddress([FromBody] CreateAddressRequest request)
    {
        var result = await _authService.AddAddressAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetAddresses),
            ApiResponse<AddressDto>.Ok(result, "Address added."));
    }

    // ── PUT /api/auth/addresses/{id} ──────────────────────────────────
    [HttpPut("addresses/{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<AddressDto>), 200)]
    public async Task<IActionResult> UpdateAddress(int id, [FromBody] CreateAddressRequest request)
    {
        var result = await _authService.UpdateAddressAsync(GetUserId(), id, request);
        return Ok(ApiResponse<AddressDto>.Ok(result, "Address updated."));
    }

    // ── DELETE /api/auth/addresses/{id} ───────────────────────────────
    [HttpDelete("addresses/{id:int}")]
    [Authorize]
    [ProducesResponseType(204)]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        await _authService.DeleteAddressAsync(GetUserId(), id);
        return NoContent();
    }

    // ── PATCH /api/auth/addresses/{id}/set-default ────────────────────
    [HttpPatch("addresses/{id:int}/set-default")]
    [Authorize]
    [ProducesResponseType(200)]
    public async Task<IActionResult> SetDefaultAddress(int id)
    {
        await _authService.SetDefaultAddressAsync(GetUserId(), id);
        return Ok(ApiResponse.OkNoData("Default address updated."));
    }

    // ── Helper ────────────────────────────────────────────────────────
    private int GetUserId() =>
        int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
}
