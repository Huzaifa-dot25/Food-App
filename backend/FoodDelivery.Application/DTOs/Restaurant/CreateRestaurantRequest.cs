namespace FoodDelivery.Application.DTOs.Restaurant;

public class CreateRestaurantRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }

    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string? Phone { get; set; }
    public string? Email { get; set; }

    public decimal MinOrderAmount { get; set; }
    public decimal DeliveryFee { get; set; }
    public int EstimatedDeliveryTimeMinutes { get; set; } = 30;

    public IList<UpsertBusinessHourRequest> BusinessHours { get; set; } = new List<UpsertBusinessHourRequest>();
}

public class UpdateRestaurantRequest : CreateRestaurantRequest { }

public class UpsertBusinessHourRequest
{
    public int DayOfWeek { get; set; }  // 0=Sun … 6=Sat
    public string OpenTime { get; set; } = "09:00";
    public string CloseTime { get; set; } = "22:00";
    public bool IsClosed { get; set; } = false;
}

public class RestaurantSearchRequest : Common.Models.PaginationRequest
{
    public string? Keyword { get; set; }
    public int? CategoryId { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? RadiusKm { get; set; } = 10;
    public double? MinRating { get; set; }
    public string? SortBy { get; set; } = "rating";  // rating | distance | deliveryFee
    public bool? IsOpen { get; set; }
}
