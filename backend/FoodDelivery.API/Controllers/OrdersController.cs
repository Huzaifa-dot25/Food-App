using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Order;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService) => _orderService = orderService;

    // ════════════════════════════════════════════════════════════════
    //  CUSTOMER ENDPOINTS
    // ════════════════════════════════════════════════════════════════

    // ── POST /api/orders ─────────────────────────────────────────────
    /// <summary>Customer: place an order from the active cart.</summary>
    [HttpPost]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 201)]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        var result = await _orderService.CreateAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<OrderDto>.Ok(result, "Order placed successfully."));
    }

    // ── GET /api/orders ───────────────────────────────────────────────
    /// <summary>Customer: paginated order history.</summary>
    [HttpGet]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<OrderSummaryDto>>), 200)]
    public async Task<IActionResult> GetHistory([FromQuery] OrderFilterRequest filter)
    {
        var result = await _orderService.GetHistoryAsync(GetUserId(), filter);
        return Ok(ApiResponse<PagedResult<OrderSummaryDto>>.Ok(result));
    }

    // ── GET /api/orders/{id} ──────────────────────────────────────────
    /// <summary>Get full order details (customer, owner, rider or admin).</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _orderService.GetByIdAsync(id, GetUserId());
        return Ok(ApiResponse<OrderDto>.Ok(result));
    }

    // ── DELETE /api/orders/{id}/cancel ────────────────────────────────
    [HttpDelete("{id:int}/cancel")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 200)]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelOrderRequest request)
    {
        var result = await _orderService.CancelAsync(GetUserId(), id, request);
        return Ok(ApiResponse<OrderDto>.Ok(result, "Order cancelled."));
    }

    // ── POST /api/orders/{id}/reorder ─────────────────────────────────
    [HttpPost("{id:int}/reorder")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 201)]
    public async Task<IActionResult> Reorder(int id)
    {
        var result = await _orderService.ReorderAsync(GetUserId(), id);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<OrderDto>.Ok(result, "Reorder placed."));
    }

    // ── GET /api/orders/{id}/track ────────────────────────────────────
    [HttpGet("{id:int}/track")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<RiderTrackingDto>), 200)]
    public async Task<IActionResult> Track(int id)
    {
        var result = await _orderService.GetTrackingAsync(id, GetUserId());
        return Ok(ApiResponse<RiderTrackingDto?>.Ok(result));
    }

    // ════════════════════════════════════════════════════════════════
    //  RESTAURANT OWNER ENDPOINTS
    // ════════════════════════════════════════════════════════════════

    // ── GET /api/orders/restaurant/{restaurantId} ─────────────────────
    [HttpGet("restaurant/{restaurantId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<OrderSummaryDto>>), 200)]
    public async Task<IActionResult> GetRestaurantOrders(
        int restaurantId, [FromQuery] OrderFilterRequest filter)
    {
        var result = await _orderService.GetRestaurantOrdersAsync(
            GetUserId(), restaurantId, filter);
        return Ok(ApiResponse<PagedResult<OrderSummaryDto>>.Ok(result));
    }

    // ── PATCH /api/orders/{id}/status ─────────────────────────────────
    [HttpPatch("{id:int}/status")]
    [Authorize(Policy = "OwnerOrAdmin")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 200)]
    public async Task<IActionResult> UpdateStatus(
        int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var result = await _orderService.UpdateStatusAsync(GetUserId(), id, request);
        return Ok(ApiResponse<OrderDto>.Ok(result, "Order status updated."));
    }

    // ── POST /api/orders/{id}/assign-rider ────────────────────────────
    [HttpPost("{id:int}/assign-rider")]
    [Authorize(Policy = "OwnerOrAdmin")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 200)]
    public async Task<IActionResult> AssignRider(
        int id, [FromBody] AssignRiderRequest request)
    {
        var result = await _orderService.AssignRiderAsync(GetUserId(), id, request.RiderId);
        return Ok(ApiResponse<OrderDto>.Ok(result, "Rider assigned."));
    }

    // ════════════════════════════════════════════════════════════════
    //  RIDER ENDPOINTS
    // ════════════════════════════════════════════════════════════════

    // ── GET /api/orders/rider/active ──────────────────────────────────
    [HttpGet("rider/active")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RiderDeliveryDto>>), 200)]
    public async Task<IActionResult> GetActiveDeliveries()
    {
        var result = await _orderService.GetActiveDeliveriesAsync(GetUserId());
        return Ok(ApiResponse<IReadOnlyList<RiderDeliveryDto>>.Ok(result));
    }

    // ── POST /api/orders/rider/{assignmentId}/accept ──────────────────
    [HttpPost("rider/{assignmentId:int}/accept")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<RiderDeliveryDto>), 200)]
    public async Task<IActionResult> AcceptDelivery(int assignmentId)
    {
        var result = await _orderService.AcceptDeliveryAsync(GetUserId(), assignmentId);
        return Ok(ApiResponse<RiderDeliveryDto>.Ok(result, "Delivery accepted."));
    }

    // ── POST /api/orders/rider/{assignmentId}/reject ──────────────────
    [HttpPost("rider/{assignmentId:int}/reject")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> RejectDelivery(int assignmentId)
    {
        await _orderService.RejectDeliveryAsync(GetUserId(), assignmentId);
        return Ok(ApiResponse.OkNoData("Delivery rejected."));
    }

    // ── POST /api/orders/rider/{assignmentId}/pickup ──────────────────
    [HttpPost("rider/{assignmentId:int}/pickup")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 200)]
    public async Task<IActionResult> ConfirmPickup(int assignmentId)
    {
        var result = await _orderService.ConfirmPickupAsync(GetUserId(), assignmentId);
        return Ok(ApiResponse<OrderDto>.Ok(result, "Pickup confirmed."));
    }

    // ── POST /api/orders/rider/{assignmentId}/deliver ─────────────────
    [HttpPost("rider/{assignmentId:int}/deliver")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<OrderDto>), 200)]
    public async Task<IActionResult> ConfirmDelivery(int assignmentId)
    {
        var result = await _orderService.ConfirmDeliveryAsync(GetUserId(), assignmentId);
        return Ok(ApiResponse<OrderDto>.Ok(result, "Delivery confirmed."));
    }

    // ── GET /api/orders/rider/history ─────────────────────────────────
    [HttpGet("rider/history")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<RiderDeliveryDto>>), 200)]
    public async Task<IActionResult> GetRiderHistory([FromQuery] PaginationRequest pagination)
    {
        var result = await _orderService.GetRiderHistoryAsync(GetUserId(), pagination);
        return Ok(ApiResponse<PagedResult<RiderDeliveryDto>>.Ok(result));
    }

    // ════════════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ════════════════════════════════════════════════════════════════

    // ── GET /api/orders/admin/all ─────────────────────────────────────
    [HttpGet("admin/all")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<OrderSummaryDto>>), 200)]
    public async Task<IActionResult> GetAllOrders([FromQuery] OrderFilterRequest filter)
    {
        var result = await _orderService.GetAllOrdersAsync(filter);
        return Ok(ApiResponse<PagedResult<OrderSummaryDto>>.Ok(result));
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
}

/// <summary>Request body for the assign-rider endpoint.</summary>
public class AssignRiderRequest
{
    public int RiderId { get; set; }
}
