namespace FoodDelivery.Domain.Entities;

/// <summary>Join table for the many-to-many User ↔ Role relationship.</summary>
public class UserRole
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}
