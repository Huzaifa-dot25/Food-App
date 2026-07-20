using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Notification;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
        => _notificationService = notificationService;

    // ── GET /api/notifications ────────────────────────────────────────
    /// <summary>Get paginated notifications for the current user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<NotificationDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] PaginationRequest pagination)
    {
        var result = await _notificationService.GetForUserAsync(GetUserId(), pagination);
        return Ok(ApiResponse<PagedResult<NotificationDto>>.Ok(result));
    }

    // ── GET /api/notifications/unread-count ───────────────────────────
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> UnreadCount()
    {
        var count = await _notificationService.GetUnreadCountAsync(GetUserId());
        return Ok(ApiResponse<object>.Ok(new { count }));
    }

    // ── PATCH /api/notifications/{id}/read ────────────────────────────
    [HttpPatch("{id:int}/read")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> MarkRead(int id)
    {
        await _notificationService.MarkReadAsync(GetUserId(), id);
        return Ok(ApiResponse.OkNoData("Marked as read."));
    }

    // ── PATCH /api/notifications/read-all ────────────────────────────
    [HttpPatch("read-all")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> MarkAllRead()
    {
        await _notificationService.MarkAllReadAsync(GetUserId());
        return Ok(ApiResponse.OkNoData("All notifications marked as read."));
    }

    // ── POST /api/notifications/send ─────────────────────────────────
    /// <summary>Admin: send a notification to a specific user.</summary>
    [HttpPost("send")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> Send([FromBody] SendNotificationRequest request)
    {
        await _notificationService.SendAsync(request);
        return Ok(ApiResponse.OkNoData("Notification sent."));
    }

    // ── POST /api/notifications/broadcast ────────────────────────────
    /// <summary>Admin: broadcast a notification to all users or a specific role.</summary>
    [HttpPost("broadcast")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest request)
    {
        await _notificationService.BroadcastAsync(request.Title, request.Body, request.Role);
        return Ok(ApiResponse.OkNoData("Broadcast sent."));
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
}

public class BroadcastRequest
{
    public string Title { get; set; } = string.Empty;
    public string Body  { get; set; } = string.Empty;
    public string? Role { get; set; }
}
