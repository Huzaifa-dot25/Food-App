using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Admin;
using FoodDelivery.Application.DTOs.Auth;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IAdminService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<IReadOnlyList<DailyRevenueDto>> GetRevenueReportAsync(RevenueReportRequest request);

    // User management
    Task<PagedResult<AdminUserDto>> GetUsersAsync(PaginationRequest pagination, string? role = null, string? status = null);
    Task<AdminUserDto> GetUserByIdAsync(int userId);
    Task<AdminUserDto> SuspendUserAsync(int userId, SuspendRequest request);
    Task<AdminUserDto> ActivateUserAsync(int userId);

    // Restaurant management
    Task<PagedResult<AdminRestaurantDto>> GetRestaurantsAsync(PaginationRequest pagination, string? status = null);
    Task<AdminRestaurantDto> ApproveRestaurantAsync(int restaurantId);
    Task<AdminRestaurantDto> SuspendRestaurantAsync(int restaurantId, SuspendRequest request);

    // Coupon management
    Task<IReadOnlyList<DTOs.Cart.ApplyCouponRequest>> GetCouponsAsync();
    Task CreateCouponAsync(object request);
    Task DeactivateCouponAsync(int couponId);
}
