using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Restaurant;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/restaurants")]
[Produces("application/json")]
public class RestaurantsController : BaseController
{
    private readonly IRestaurantService _restaurantService;

    public RestaurantsController(IRestaurantService restaurantService)
        => _restaurantService = restaurantService;

    // ── GET /api/restaurants ─────────────────────────────────────────
    /// <summary>Search/filter restaurants with pagination.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<RestaurantSummaryDto>>), 200)]
    public async Task<IActionResult> Search([FromQuery] RestaurantSearchRequest request)
    {
        var result = await _restaurantService.SearchAsync(request, GetOptionalUserId());
        return Ok(ApiResponse<PagedResult<RestaurantSummaryDto>>.Ok(result));
    }

    // ── GET /api/restaurants/featured ────────────────────────────────
    /// <summary>Top-rated open restaurants.</summary>
    [HttpGet("featured")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RestaurantSummaryDto>>), 200)]
    public async Task<IActionResult> Featured()
    {
        var result = await _restaurantService.GetFeaturedAsync(GetOptionalUserId());
        return Ok(ApiResponse<IReadOnlyList<RestaurantSummaryDto>>.Ok(result));
    }

    // ── GET /api/restaurants/nearby ───────────────────────────────────
    /// <summary>Restaurants within a radius of the caller's GPS position.</summary>
    [HttpGet("nearby")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RestaurantSummaryDto>>), 200)]
    public async Task<IActionResult> Nearby(
        [FromQuery] double lat,
        [FromQuery] double lng,
        [FromQuery] double radiusKm = 10)
    {
        var result = await _restaurantService.GetNearbyAsync(lat, lng, radiusKm, GetOptionalUserId());
        return Ok(ApiResponse<IReadOnlyList<RestaurantSummaryDto>>.Ok(result));
    }

    // ── GET /api/restaurants/my ───────────────────────────────────────
    /// <summary>Get the authenticated owner's restaurant.</summary>
    [HttpGet("my")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<RestaurantDto>), 200)]
    public async Task<IActionResult> GetMine()
    {
        var result = await _restaurantService.GetOwnerRestaurantAsync(GetUserId());
        return Ok(ApiResponse<RestaurantDto>.Ok(result));
    }

    // ── GET /api/restaurants/favorites ───────────────────────────────
    [HttpGet("favorites")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<RestaurantSummaryDto>>), 200)]
    public async Task<IActionResult> GetFavorites([FromQuery] PaginationRequest pagination)
    {
        var result = await _restaurantService.GetFavoritesAsync(GetUserId(), pagination);
        return Ok(ApiResponse<PagedResult<RestaurantSummaryDto>>.Ok(result));
    }

    // ── GET /api/restaurants/{id} ─────────────────────────────────────
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<RestaurantDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _restaurantService.GetByIdAsync(id, GetOptionalUserId());
        return Ok(ApiResponse<RestaurantDto>.Ok(result));
    }

    // ── POST /api/restaurants ─────────────────────────────────────────
    [HttpPost]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<RestaurantDto>), 201)]
    public async Task<IActionResult> Create([FromBody] CreateRestaurantRequest request)
    {
        var result = await _restaurantService.CreateAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<RestaurantDto>.Ok(result, "Restaurant created. Pending admin approval."));
    }

    // ── PUT /api/restaurants/{id} ─────────────────────────────────────
    [HttpPut("{id:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<RestaurantDto>), 200)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRestaurantRequest request)
    {
        var result = await _restaurantService.UpdateAsync(GetUserId(), id, request);
        return Ok(ApiResponse<RestaurantDto>.Ok(result, "Restaurant updated."));
    }

    // ── DELETE /api/restaurants/{id} ──────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(int id)
    {
        await _restaurantService.DeleteAsync(GetUserId(), id);
        return NoContent();
    }

    // ── POST /api/restaurants/{id}/logo ───────────────────────────────
    [HttpPost("{id:int}/logo")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> UploadLogo(int id, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided."));

        await using var stream = file.OpenReadStream();
        var url = await _restaurantService.UploadLogoAsync(GetUserId(), id, stream, file.FileName);
        return Ok(ApiResponse<object>.Ok(new { imageUrl = url }));
    }

    // ── POST /api/restaurants/{id}/cover ──────────────────────────────
    [HttpPost("{id:int}/cover")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> UploadCover(int id, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided."));

        await using var stream = file.OpenReadStream();
        var url = await _restaurantService.UploadCoverAsync(GetUserId(), id, stream, file.FileName);
        return Ok(ApiResponse<object>.Ok(new { imageUrl = url }));
    }

    // ── PUT /api/restaurants/{id}/hours ───────────────────────────────
    [HttpPut("{id:int}/hours")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> UpdateHours(
        int id, [FromBody] IList<UpsertBusinessHourRequest> hours)
    {
        await _restaurantService.UpdateBusinessHoursAsync(GetUserId(), id, hours);
        return Ok(ApiResponse.OkNoData("Business hours updated."));
    }

    // ── POST /api/restaurants/{id}/favorites ──────────────────────────
    [HttpPost("{id:int}/favorites")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> AddFavorite(int id)
    {
        await _restaurantService.AddFavoriteAsync(GetUserId(), id);
        return Ok(ApiResponse.OkNoData("Added to favorites."));
    }

    // ── DELETE /api/restaurants/{id}/favorites ────────────────────────
    [HttpDelete("{id:int}/favorites")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> RemoveFavorite(int id)
    {
        await _restaurantService.RemoveFavoriteAsync(GetUserId(), id);
        return NoContent();
    }

}
