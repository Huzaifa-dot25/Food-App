namespace FoodDelivery.Application.DTOs.Auth;

/// <summary>Request body for POST /api/auth/login</summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    /// <summary>Optional FCM device token to register for push notifications on login.</summary>
    public string? FcmToken { get; set; }
}
