namespace FoodDelivery.Domain.Entities;

public class Address : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Label { get; set; } = "Home";        // Home / Work / Other
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string? Apartment { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsDefault { get; set; } = false;

    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
