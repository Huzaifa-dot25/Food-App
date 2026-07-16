namespace FoodDelivery.Domain.Entities;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;        // Customer, Owner, Rider, Admin

    // Navigation
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
