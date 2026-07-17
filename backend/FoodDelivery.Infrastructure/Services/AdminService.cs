using AutoMapper;
using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Admin;
using FoodDelivery.Application.DTOs.Auth;
using FoodDelivery.Application.DTOs.Cart;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _context;
    private readonly IMapper      _mapper;

    public AdminService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    // ── Dashboard ─────────────────────────────────────────────────────
    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var today = DateTime.UtcNow.Date;

        var totalUsers       = await _context.Users.CountAsync();
        var totalRestaurants = await _context.Restaurants.CountAsync();
        var totalRiders      = await _context.Riders.CountAsync();
        var totalOrders      = await _context.Orders.CountAsync();
        var pendingOrders    = await _context.Orders
            .CountAsync(o => o.Status == OrderStatus.Pending);
        var activeRiders     = await _context.Riders
            .CountAsync(r => r.IsAvailable && r.Status == RiderStatus.Active);

        var totalRevenue = await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        var todayRevenue = await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered &&
                        o.CreatedAt.Date == today)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        var todayOrders = await _context.Orders
            .CountAsync(o => o.CreatedAt.Date == today);

        // Last 7 days revenue chart
        var chart = await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered &&
                        o.CreatedAt >= DateTime.UtcNow.AddDays(-7))
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new DailyRevenueDto
            {
                Date         = g.Key.ToString("yyyy-MM-dd"),
                TotalOrders  = g.Count(),
                TotalRevenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(d => d.Date)
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalUsers       = totalUsers,
            TotalRestaurants = totalRestaurants,
            TotalRiders      = totalRiders,
            TotalOrders      = totalOrders,
            PendingOrders    = pendingOrders,
            ActiveRiders     = activeRiders,
            TotalRevenue     = totalRevenue,
            TodayRevenue     = todayRevenue,
            TodayOrders      = todayOrders,
            RevenueChart     = chart
        };
    }

    public async Task<IReadOnlyList<DailyRevenueDto>> GetRevenueReportAsync(
        RevenueReportRequest request)
    {
        return await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered &&
                        o.CreatedAt >= request.From &&
                        o.CreatedAt <= request.To)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new DailyRevenueDto
            {
                Date         = g.Key.ToString("yyyy-MM-dd"),
                TotalOrders  = g.Count(),
                TotalRevenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(d => d.Date)
            .ToListAsync();
    }

    // ── Users ─────────────────────────────────────────────────────────
    public async Task<PagedResult<AdminUserDto>> GetUsersAsync(
        PaginationRequest pagination, string? role = null, string? status = null)
    {
        var query = _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<UserStatus>(status, true, out var userStatus))
            query = query.Where(u => u.Status == userStatus);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<AdminUserDto>.Create(
            _mapper.Map<IReadOnlyList<AdminUserDto>>(items),
            total, pagination.PageNumber, pagination.PageSize);
    }

    public async Task<AdminUserDto> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException("User", userId);
        return _mapper.Map<AdminUserDto>(user);
    }

    public async Task<AdminUserDto> SuspendUserAsync(int userId, SuspendRequest request)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new NotFoundException("User", userId);
        user.Status = UserStatus.Suspended;
        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(userId);
    }

    public async Task<AdminUserDto> ActivateUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new NotFoundException("User", userId);
        user.Status = UserStatus.Active;
        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(userId);
    }

    // ── Restaurants ───────────────────────────────────────────────────
    public async Task<PagedResult<AdminRestaurantDto>> GetRestaurantsAsync(
        PaginationRequest pagination, string? status = null)
    {
        var query = _context.Restaurants
            .Include(r => r.Owner)
            .Include(r => r.Orders)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<RestaurantStatus>(status, true, out var rs))
            query = query.Where(r => r.Status == rs);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<AdminRestaurantDto>.Create(
            _mapper.Map<IReadOnlyList<AdminRestaurantDto>>(items),
            total, pagination.PageNumber, pagination.PageSize);
    }

    public async Task<AdminRestaurantDto> ApproveRestaurantAsync(int restaurantId)
    {
        var r = await _context.Restaurants.FindAsync(restaurantId)
            ?? throw new NotFoundException("Restaurant", restaurantId);
        r.Status = RestaurantStatus.Active;
        await _context.SaveChangesAsync();
        return _mapper.Map<AdminRestaurantDto>(r);
    }

    public async Task<AdminRestaurantDto> SuspendRestaurantAsync(
        int restaurantId, SuspendRequest request)
    {
        var r = await _context.Restaurants.FindAsync(restaurantId)
            ?? throw new NotFoundException("Restaurant", restaurantId);
        r.Status = RestaurantStatus.Suspended;
        await _context.SaveChangesAsync();
        return _mapper.Map<AdminRestaurantDto>(r);
    }

    // ── Coupons ───────────────────────────────────────────────────────
    public async Task<IReadOnlyList<ApplyCouponRequest>> GetCouponsAsync()
        => new List<ApplyCouponRequest>(); // Placeholder — full DTO returned by controller

    public async Task CreateCouponAsync(object request) { }

    public async Task DeactivateCouponAsync(int couponId)
    {
        var coupon = await _context.Coupons.FindAsync(couponId)
            ?? throw new NotFoundException("Coupon", couponId);
        coupon.IsActive = false;
        await _context.SaveChangesAsync();
    }
}
