using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Review;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/reviews")]
[Produces("application/json")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
        => _reviewService = reviewService;

    // ── GET /api/reviews/restaurant/{restaurantId} ────────────────────
    /// <summary>Public: paginated reviews for a restaurant.</summary>
    [HttpGet("restaurant/{restaurantId:int}")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ReviewDto>>), 200)]
    public async Task<IActionResult> GetRestaurantReviews(
        int restaurantId, [FromQuery] PaginationRequest pagination)
    {
        var result = await _reviewService.GetRestaurantReviewsAsync(restaurantId, pagination);
        return Ok(ApiResponse<PagedResult<ReviewDto>>.Ok(result));
    }

    // ── POST /api/reviews ─────────────────────────────────────────────
    /// <summary>Customer: leave a review on a delivered order (one per order).</summary>
    [HttpPost]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
    {
        var result = await _reviewService.CreateAsync(GetUserId(), request);
        return StatusCode(201, ApiResponse<ReviewDto>.Ok(result, "Review submitted."));
    }

    // ── POST /api/reviews/{id}/reply ──────────────────────────────────
    /// <summary>Owner: reply to a review on their restaurant.</summary>
    [HttpPost("{id:int}/reply")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto>), 200)]
    public async Task<IActionResult> Reply(int id, [FromBody] ReplyToReviewRequest request)
    {
        var result = await _reviewService.ReplyAsync(GetUserId(), id, request);
        return Ok(ApiResponse<ReviewDto>.Ok(result, "Reply posted."));
    }

    // ── DELETE /api/reviews/{id} ──────────────────────────────────────
    /// <summary>Admin: remove an inappropriate review.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(int id)
    {
        await _reviewService.DeleteAsync(GetUserId(), id);
        return NoContent();
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
}
