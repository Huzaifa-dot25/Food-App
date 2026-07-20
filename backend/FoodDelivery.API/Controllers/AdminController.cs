using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Admin;
using FoodDelivery.Application.DTOs.Rider;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly IAdminService  _adminService;
    private readonly IRiderService  _riderService;
    private readonly AppDbContext   _context;

    public AdminController(
        IAdminService adminService,
        IRiderService riderService,
        AppDbContext context)
    {
        _adminService = adminService;
        _riderService = riderService;
        _context      = context;
    }

    // ── GET /api/admin/dashboard ──────────────────────────────────────
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ApiResponse<DashboardStatsDto>), 200)]
    public async Task<IActionResult> Dashboard()
    {
        var result = await _adminService.GetDashboardStatsAsync();
        return Ok(ApiResponse<DashboardStatsDto>.Ok(result));
    }

    // ── GET /api/admin/revenue ────────────────────────────────────────
    [HttpGet("revenue")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DailyRevenueDto>>), 200)]
    public async Task<IActionResult> Revenue([FromQuery] RevenueReportRequest request)
    {
        var result = await _adminService.GetRevenueReportAsync(request);
        return Ok(ApiResponse<IReadOnlyList<DailyRevenueDto>>.Ok(result));
    }

    // ════════════════════════════════════════════════════════════════
    //  USER MANAGEMENT
    // ════════════════════════════════════════════════════════════════

    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AdminUserDto>>), 200)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] string? role   = null,
        [FromQuery] string? status = null)
    {
        var result = await _adminService.GetUsersAsync(pagination, role, status);
        return Ok(ApiResponse<PagedResult<AdminUserDto>>.Ok(result));
    }

    [HttpGet("users/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<AdminUserDto>), 200)]
    public async Task<IActionResult> GetUser(int id)
    {
        var result = await _adminService.GetUserByIdAsync(id);
        return Ok(ApiResponse<AdminUserDto>.Ok(result));
    }

    [HttpPatch("users/{id:int}/suspend")]
    [ProducesResponseType(typeof(ApiResponse<AdminUserDto>), 200)]
    public async Task<IActionResult> SuspendUser(int id, [FromBody] SuspendRequest request)
    {
        var result = await _adminService.SuspendUserAsync(id, request);
        return Ok(ApiResponse<AdminUserDto>.Ok(result, "User suspended."));
    }

    [HttpPatch("users/{id:int}/activate")]
    [ProducesResponseType(typeof(ApiResponse<AdminUserDto>), 200)]
    public async Task<IActionResult> ActivateUser(int id)
    {
        var result = await _adminService.ActivateUserAsync(id);
        return Ok(ApiResponse<AdminUserDto>.Ok(result, "User activated."));
    }

    // ════════════════════════════════════════════════════════════════
    //  RESTAURANT MANAGEMENT
    // ════════════════════════════════════════════════════════════════

    [HttpGet("restaurants")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AdminRestaurantDto>>), 200)]
    public async Task<IActionResult> GetRestaurants(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] string? status = null)
    {
        var result = await _adminService.GetRestaurantsAsync(pagination, status);
        return Ok(ApiResponse<PagedResult<AdminRestaurantDto>>.Ok(result));
    }

    [HttpPatch("restaurants/{id:int}/approve")]
    [ProducesResponseType(typeof(ApiResponse<AdminRestaurantDto>), 200)]
    public async Task<IActionResult> ApproveRestaurant(int id)
    {
        var result = await _adminService.ApproveRestaurantAsync(id);
        return Ok(ApiResponse<AdminRestaurantDto>.Ok(result, "Restaurant approved."));
    }

    [HttpPatch("restaurants/{id:int}/suspend")]
    [ProducesResponseType(typeof(ApiResponse<AdminRestaurantDto>), 200)]
    public async Task<IActionResult> SuspendRestaurant(int id, [FromBody] SuspendRequest request)
    {
        var result = await _adminService.SuspendRestaurantAsync(id, request);
        return Ok(ApiResponse<AdminRestaurantDto>.Ok(result, "Restaurant suspended."));
    }

    // ════════════════════════════════════════════════════════════════
    //  RIDER MANAGEMENT
    // ════════════════════════════════════════════════════════════════

    [HttpGet("riders")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<RiderDto>>), 200)]
    public async Task<IActionResult> GetRiders(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] string? status = null)
    {
        var result = await _riderService.GetAllAsync(pagination, status);
        return Ok(ApiResponse<PagedResult<RiderDto>>.Ok(result));
    }

    [HttpPatch("riders/{id:int}/approve")]
    [ProducesResponseType(typeof(ApiResponse<RiderDto>), 200)]
    public async Task<IActionResult> ApproveRider(int id)
    {
        var result = await _riderService.ApproveAsync(id);
        return Ok(ApiResponse<RiderDto>.Ok(result, "Rider approved."));
    }

    [HttpPatch("riders/{id:int}/suspend")]
    [ProducesResponseType(typeof(ApiResponse<RiderDto>), 200)]
    public async Task<IActionResult> SuspendRider(int id, [FromBody] SuspendRequest request)
    {
        var result = await _riderService.SuspendAsync(id, request.Reason);
        return Ok(ApiResponse<RiderDto>.Ok(result, "Rider suspended."));
    }

    // ════════════════════════════════════════════════════════════════
    //  COUPON MANAGEMENT
    // ════════════════════════════════════════════════════════════════

    [HttpGet("coupons")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetCoupons()
    {
        var coupons = await _context.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id, c.Code, c.Description,
                c.DiscountType, c.DiscountValue,
                c.MinOrderAmount, c.MaxDiscountAmount,
                c.UsageLimit, c.UsedCount,
                ExpiryDate = c.ExpiryDate.ToString("yyyy-MM-dd"),
                c.IsActive
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(coupons));
    }

    [HttpPost("coupons")]
    [ProducesResponseType(typeof(ApiResponse<object>), 201)]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponRequest request)
    {
        if (!Enum.TryParse<Domain.Enums.DiscountType>(
            request.DiscountType, true, out var discountType))
            return BadRequest(ApiResponse<object>.Fail("Invalid discount type."));

        var coupon = new Domain.Entities.Coupon
        {
            Code              = request.Code.ToUpper().Trim(),
            Description       = request.Description,
            DiscountType      = discountType,
            DiscountValue     = request.DiscountValue,
            MinOrderAmount    = request.MinOrderAmount,
            MaxDiscountAmount = request.MaxDiscountAmount,
            UsageLimit        = request.UsageLimit,
            ExpiryDate        = request.ExpiryDate,
            IsActive          = true
        };

        await _context.Coupons.AddAsync(coupon);
        await _context.SaveChangesAsync();

        return StatusCode(201, ApiResponse<object>.Ok(new { coupon.Id, coupon.Code },
            "Coupon created."));
    }

    [HttpPatch("coupons/{id:int}/deactivate")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> DeactivateCoupon(int id)
    {
        await _adminService.DeactivateCouponAsync(id);
        return Ok(ApiResponse.OkNoData("Coupon deactivated."));
    }
}

public class CreateCouponRequest
{
    public string Code              { get; set; } = string.Empty;
    public string Description       { get; set; } = string.Empty;
    public string DiscountType      { get; set; } = "Percentage";
    public decimal DiscountValue    { get; set; }
    public decimal MinOrderAmount   { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int UsageLimit           { get; set; } = 100;
    public DateTime ExpiryDate      { get; set; }
}
