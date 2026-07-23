using AutoMapper;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.DTOs.Auth;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using FoodDelivery.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace FoodDelivery.Tests.Unit;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository>     _userRepoMock     = new();
    private readonly Mock<IEmailService>       _emailMock        = new();
    private readonly Mock<IFileStorageService> _fileMock         = new();
    private readonly Mock<IMapper>             _mapperMock       = new();
    private readonly AppDbContext              _dbContext;
    private readonly JwtTokenService           _jwtService;
    private readonly AuthService               _authService;

    public AuthServiceTests()
    {
        // In-memory EF Core database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _dbContext = new AppDbContext(options);

        // Seed roles
        _dbContext.Roles.AddRange(
            new Role { Id = 1, Name = "Customer" },
            new Role { Id = 2, Name = "Owner" },
            new Role { Id = 3, Name = "Rider" },
            new Role { Id = 4, Name = "Admin" }
        );
        _dbContext.SaveChanges();

        // JWT config
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"]                = "SuperSecretKeyForTestingPurposes123456!",
                ["JwtSettings:Issuer"]                   = "TestIssuer",
                ["JwtSettings:Audience"]                 = "TestAudience",
                ["JwtSettings:AccessTokenExpiryMinutes"] = "15",
                ["JwtSettings:RefreshTokenExpiryDays"]   = "7",
            })
            .Build();

        _jwtService = new JwtTokenService(config);

        var loggerMock = new Mock<Microsoft.Extensions.Logging.ILogger<AuthService>>();

        _authService = new AuthService(
            _userRepoMock.Object,
            _dbContext,
            _jwtService,
            _emailMock.Object,
            _fileMock.Object,
            _mapperMock.Object,
            loggerMock.Object
        );
    }

    // ── Register Tests ─────────────────────────────────────────────

    [Fact]
    public async Task Register_WithValidRequest_ReturnsAuthResponse()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FirstName       = "John",
            LastName        = "Doe",
            Email           = "john@test.com",
            PhoneNumber     = "+1234567890",
            Password        = "Test@1234",
            ConfirmPassword = "Test@1234",
            Role            = "Customer"
        };

        _userRepoMock
            .Setup(r => r.EmailExistsAsync(request.Email))
            .ReturnsAsync(false);

        _userRepoMock
            .Setup(r => r.AddAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask)
            .Callback<User>(u => { u.Id = 1; });

        _userRepoMock
            .Setup(r => r.GetWithRolesAsync(1))
            .ReturnsAsync(new User
            {
                Id          = 1,
                FirstName   = "John",
                LastName    = "Doe",
                Email       = "john@test.com",
                PhoneNumber = "+1234567890",
                PasswordHash= BCrypt.Net.BCrypt.HashPassword("Test@1234"),
                UserRoles   = new List<UserRole>
                {
                    new() { RoleId = 1, Role = new Role { Id = 1, Name = "Customer" } }
                }
            });

        _emailMock.Setup(e => e.SendOtpEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);
        _emailMock.Setup(e => e.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("john@test.com");
        result.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.Roles.Should().Contain("Customer");
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ThrowsValidationException()
    {
        // Arrange
        _userRepoMock
            .Setup(r => r.EmailExistsAsync("duplicate@test.com"))
            .ReturnsAsync(true);

        var request = new RegisterRequest
        {
            FirstName       = "Jane",
            LastName        = "Doe",
            Email           = "duplicate@test.com",
            PhoneNumber     = "+1234567890",
            Password        = "Test@1234",
            ConfirmPassword = "Test@1234",
            Role            = "Customer"
        };

        // Act
        Func<Task> act = async () => await _authService.RegisterAsync(request);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*already exists*");
    }

    // ── Login Tests ────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var hashedPwd = BCrypt.Net.BCrypt.HashPassword("Test@1234");
        var user = new User
        {
            Id           = 1,
            Email        = "user@test.com",
            PasswordHash = hashedPwd,
            Status       = UserStatus.Active,
            FirstName    = "Test",
            LastName     = "User",
            PhoneNumber  = "+1234567890",
            UserRoles    = new List<UserRole>
            {
                new() { RoleId = 1, Role = new Role { Id = 1, Name = "Customer" } }
            }
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync("user@test.com")).ReturnsAsync(user);
        _userRepoMock.Setup(r => r.GetWithRolesAsync(1)).ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(new LoginRequest
        {
            Email    = "user@test.com",
            Password = "Test@1234"
        });

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrEmpty();
        result.Roles.Should().Contain("Customer");
    }

    [Fact]
    public async Task Login_WithWrongPassword_ThrowsValidationException()
    {
        // Arrange
        var user = new User
        {
            Id           = 1,
            Email        = "user@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword@1"),
            Status       = UserStatus.Active,
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(new LoginRequest
        {
            Email    = "user@test.com",
            Password = "WrongPassword@1"
        });

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*Invalid email or password*");
    }

    [Fact]
    public async Task Login_WithSuspendedAccount_ThrowsUnauthorizedException()
    {
        // Arrange
        var user = new User
        {
            Id           = 1,
            Email        = "suspended@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@1234"),
            Status       = UserStatus.Suspended,
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync("suspended@test.com")).ReturnsAsync(user);

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(new LoginRequest
        {
            Email    = "suspended@test.com",
            Password = "Test@1234"
        });

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>()
            .WithMessage("*suspended*");
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ThrowsValidationException()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByEmailAsync("ghost@test.com"))
            .ReturnsAsync((User?)null);

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(new LoginRequest
        {
            Email    = "ghost@test.com",
            Password = "Test@1234"
        });

        // Assert
        await act.Should().ThrowAsync<ValidationException>();
    }

    // ── OTP Tests ──────────────────────────────────────────────────

    [Fact]
    public async Task VerifyOtp_WithValidCode_SetsEmailVerified()
    {
        // Arrange
        var user = new User
        {
            Id              = 99,
            Email           = "otp@test.com",
            OtpCode         = "123456",
            OtpExpiry       = DateTime.UtcNow.AddMinutes(5),
            IsEmailVerified = false
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        _userRepoMock.Setup(r => r.GetByEmailAsync("otp@test.com")).ReturnsAsync(user);

        // Act
        await _authService.VerifyOtpAsync(new VerifyOtpRequest
        {
            Email   = "otp@test.com",
            OtpCode = "123456"
        });

        // Assert
        var updated = await _dbContext.Users.FindAsync(99);
        updated!.IsEmailVerified.Should().BeTrue();
        updated.OtpCode.Should().BeNull();
    }

    [Fact]
    public async Task VerifyOtp_WithExpiredCode_ThrowsValidationException()
    {
        // Arrange
        var user = new User
        {
            Id        = 100,
            Email     = "expired@test.com",
            OtpCode   = "999999",
            OtpExpiry = DateTime.UtcNow.AddMinutes(-1), // expired
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        _userRepoMock.Setup(r => r.GetByEmailAsync("expired@test.com")).ReturnsAsync(user);

        // Act
        Func<Task> act = async () => await _authService.VerifyOtpAsync(new VerifyOtpRequest
        {
            Email   = "expired@test.com",
            OtpCode = "999999"
        });

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*expired*");
    }

    // ── JWT Tests ──────────────────────────────────────────────────

    [Fact]
    public void GenerateAccessToken_ProducesValidJwt()
    {
        // Arrange
        var user  = new User { Id = 1, Email = "jwt@test.com", FirstName = "JWT", LastName = "Test" };
        var roles = new[] { "Customer" };

        // Act
        var token = _jwtService.GenerateAccessToken(user, roles);

        // Assert
        token.Should().NotBeNullOrEmpty();
        token.Split('.').Should().HaveCount(3, "JWT must have header.payload.signature");
    }

    [Fact]
    public void HashRefreshToken_IsDeterministic()
    {
        // Arrange
        const string rawToken = "my-refresh-token-value";

        // Act
        var hash1 = _jwtService.HashRefreshToken(rawToken);
        var hash2 = _jwtService.HashRefreshToken(rawToken);

        // Assert
        hash1.Should().Be(hash2);
        hash1.Should().NotBe(rawToken);
    }
}
