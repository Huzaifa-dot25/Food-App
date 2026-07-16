using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Domain.Entities;

public class Restaurant : BaseEntity
{
    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public int CategoryId { get; set; }
    public RestaurantCategory Category { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LogoImageUrl { get; set; }
    public string? CoverImageUrl { get; set; }

    // Location
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string? Phone { get; set; }
    public string? Email { get; set; }

    // Ratings (updated via trigger or service after each review)
    public double AverageRating { get; set; } = 0;
    public int TotalRatings { get; set; } = 0;

    // Order settings
    public decimal MinOrderAmount { get; set; } = 0;
    public decimal DeliveryFee { get; set; } = 0;
    public int EstimatedDeliveryTimeMinutes { get; set; } = 30;

    public bool IsCurrentlyOpen { get; set; } = false;
    public RestaurantStatus Status { get; set; } = RestaurantStatus.PendingApproval;

    // Navigation
    public ICollection<BusinessHour> BusinessHours { get; set; } = new List<BusinessHour>();
    public ICollection<FoodCategory> FoodCategories { get; set; } = new List<FoodCategory>();
    public ICollection<Food> Foods { get; set; } = new List<Food>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}
