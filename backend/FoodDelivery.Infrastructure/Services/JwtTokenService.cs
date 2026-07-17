using FoodDelivery.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace FoodDelivery.Infrastructure.Services;

/// <summary>
/// Generates and validates JWT access tokens and opaque refresh tokens.
/// </summary>
public class JwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config) => _config = config;

    /// <summary>Create a signed JWT access token (short-lived).</summary>
    public string GenerateAccessToken(User user, IEnumerable<string> roles)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry      = DateTime.UtcNow.AddMinutes(
            int.Parse(jwtSettings["AccessTokenExpiryMinutes"] ?? "15"));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email,          user.Email),
            new(ClaimTypes.GivenName,      user.FirstName),
            new(ClaimTypes.Surname,        user.LastName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64)
        };

        // Add all roles as separate claims
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var token = new JwtSecurityToken(
            issuer:             jwtSettings["Issuer"],
            audience:           jwtSettings["Audience"],
            claims:             claims,
            notBefore:          DateTime.UtcNow,
            expires:            expiry,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Generate a cryptographically secure opaque refresh token.
    /// Stored as a hash in the database.
    /// </summary>
    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    /// <summary>Hash a refresh token before storing it in the DB.</summary>
    public string HashRefreshToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    public DateTime GetRefreshTokenExpiry()
    {
        var days = int.Parse(
            _config["JwtSettings:RefreshTokenExpiryDays"] ?? "7");
        return DateTime.UtcNow.AddDays(days);
    }

    public DateTime GetAccessTokenExpiry()
    {
        var minutes = int.Parse(
            _config["JwtSettings:AccessTokenExpiryMinutes"] ?? "15");
        return DateTime.UtcNow.AddMinutes(minutes);
    }
}
