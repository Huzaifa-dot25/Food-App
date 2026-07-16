namespace FoodDelivery.Application.DTOs.Rider;

public class RiderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }

    public string VehicleType { get; set; } = string.Empty;
    public string? VehiclePlate { get; set; }
    public string? LicenseNumber { get; set; }

    public double? CurrentLatitude { get; set; }
    public double? CurrentLongitude { get; set; }

    public bool IsAvailable { get; set; }
    public string Status { get; set; } = string.Empty;

    public int TotalDeliveries { get; set; }
    public decimal TotalEarnings { get; set; }
}

public class RiderRegistrationRequest
{
    public string VehicleType { get; set; } = string.Empty;
    public string? VehiclePlate { get; set; }
    public string? LicenseNumber { get; set; }
}

public class UpdateRiderLocationRequest
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class RiderDeliveryDto
{
    public int AssignmentId { get; set; }
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;

    // Pickup (restaurant)
    public string RestaurantName { get; set; } = string.Empty;
    public string RestaurantAddress { get; set; } = string.Empty;
    public double RestaurantLatitude { get; set; }
    public double RestaurantLongitude { get; set; }

    // Drop-off (customer)
    public string CustomerName { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public double DeliveryLatitude { get; set; }
    public double DeliveryLongitude { get; set; }
    public string? DeliveryInstructions { get; set; }

    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public bool IsAccepted { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? PickedUpAt { get; set; }
}
