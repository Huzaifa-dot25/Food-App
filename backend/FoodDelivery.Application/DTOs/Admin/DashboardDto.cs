namespace FoodDelivery.Application.DTOs.Admin;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalRestaurants { get; set; }
    public int TotalRiders { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int ActiveRiders { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TodayRevenue { get; set; }
    public int TodayOrders { get; set; }
    public IReadOnlyList<DailyRevenueDto> RevenueChart { get; set; } = Array.Empty<DailyRevenueDto>();
}

public class DailyRevenueDto
{
    public string Date { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class AdminUserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
    public DateTime CreatedAt { get; set; }
}

public class AdminRestaurantDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SuspendRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class RevenueReportRequest
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public string GroupBy { get; set; } = "day"; // day | week | month
}
