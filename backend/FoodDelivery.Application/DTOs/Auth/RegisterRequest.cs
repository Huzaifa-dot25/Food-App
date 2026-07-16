namespace FoodDelivery.Application.DTOs.Auth;

/// <summary>Request body for POST /api/auth/register</summary>
public class RegisterRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;

    /// <summary>Desired role: Customer | Owner | Rider</summary>
    public string Role { get; set; } = "Customer";
}
