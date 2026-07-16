using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public string? FcmToken { get; set; }               // Firebase Cloud Messaging device token

    public UserStatus Status { get; set; } = UserStatus.Active;
    public bool IsEmailVerified { get; set; } = false;

    // OTP for email verification and password reset
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiry { get; set; }

    // Refresh token (stored hashed)
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public Rider? Rider { get; set; }
    public ICollection<Restaurant> OwnedRestaurants { get; set; } = new List<Restaurant>();

    // Computed helper
    public string FullName => $"{FirstName} {LastName}";
}
