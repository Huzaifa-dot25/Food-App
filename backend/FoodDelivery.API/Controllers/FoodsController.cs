using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Food;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/foods")]
[Produces("application/json")]
public class FoodsController : ControllerBase
{
    private readonly IFoodService _foodService;

    public FoodsController(IFoodService foodService) => _foodService = foodService;

    // ── GET /api/foods ───────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<FoodSummaryDto>>), 200)]
    public async Task<IActionResult> Search([FromQuery] FoodSearchRequest request)
    {
        var result = await _foodService.SearchAsync(request);
        return Ok(ApiResponse<PagedResult<FoodSummaryDto>>.Ok(result));
    }

    // ── GET /api/foods/{id} ──────────────────────────────────────────
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<FoodDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _foodService.GetByIdAsync(id);
        return Ok(ApiResponse<FoodDto>.Ok(result));
    }

    // ── GET /api/foods/restaurant/{restaurantId} ─────────────────────
    [HttpGet("restaurant/{restaurantId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FoodSummaryDto>>), 200)]
    public async Task<IActionResult> GetByRestaurant(
        int restaurantId, [FromQuery] int? categoryId = null)
    {
        var result = await _foodService.GetByRestaurantAsync(restaurantId, categoryId);
        return Ok(ApiResponse<IReadOnlyList<FoodSummaryDto>>.Ok(result));
    }

    // ── GET /api/foods/restaurant/{restaurantId}/bestsellers ──────────
    [HttpGet("restaurant/{restaurantId:int}/bestsellers")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FoodSummaryDto>>), 200)]
    public async Task<IActionResult> GetBestSellers(int restaurantId)
    {
        var result = await _foodService.GetBestSellersAsync(restaurantId);
        return Ok(ApiResponse<IReadOnlyList<FoodSummaryDto>>.Ok(result));
    }

    // ── GET /api/foods/restaurant/{restaurantId}/popular ─────────────
    [HttpGet("restaurant/{restaurantId:int}/popular")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FoodSummaryDto>>), 200)]
    public async Task<IActionResult> GetPopular(int restaurantId)
    {
        var result = await _foodService.GetPopularAsync(restaurantId);
        return Ok(ApiResponse<IReadOnlyList<FoodSummaryDto>>.Ok(result));
    }

    // ── GET /api/foods/restaurant/{restaurantId}/recommended ──────────
    [HttpGet("restaurant/{restaurantId:int}/recommended")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FoodSummaryDto>>), 200)]
    public async Task<IActionResult> GetRecommended(int restaurantId)
    {
        var result = await _foodService.GetRecommendedAsync(restaurantId);
        return Ok(ApiResponse<IReadOnlyList<FoodSummaryDto>>.Ok(result));
    }

    // ── GET /api/foods/categories/restaurant/{restaurantId} ───────────
    [HttpGet("categories/restaurant/{restaurantId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FoodCategoryDto>>), 200)]
    public async Task<IActionResult> GetCategories(int restaurantId)
    {
        var result = await _foodService.GetCategoriesAsync(restaurantId);
        return Ok(ApiResponse<IReadOnlyList<FoodCategoryDto>>.Ok(result));
    }

    // ── POST /api/foods/categories/restaurant/{restaurantId} ──────────
    [HttpPost("categories/restaurant/{restaurantId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<FoodCategoryDto>), 201)]
    public async Task<IActionResult> CreateCategory(
        int restaurantId, [FromBody] CreateFoodCategoryRequest request)
    {
        var result = await _foodService.CreateCategoryAsync(GetUserId(), restaurantId, request);
        return StatusCode(201, ApiResponse<FoodCategoryDto>.Ok(result, "Category created."));
    }

    // ── PUT /api/foods/categories/restaurant/{restaurantId}/{categoryId}
    [HttpPut("categories/restaurant/{restaurantId:int}/{categoryId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<FoodCategoryDto>), 200)]
    public async Task<IActionResult> UpdateCategory(
        int restaurantId, int categoryId, [FromBody] CreateFoodCategoryRequest request)
    {
        var result = await _foodService.UpdateCategoryAsync(
            GetUserId(), restaurantId, categoryId, request);
        return Ok(ApiResponse<FoodCategoryDto>.Ok(result, "Category updated."));
    }

    // ── DELETE /api/foods/categories/restaurant/{restaurantId}/{categoryId}
    [HttpDelete("categories/restaurant/{restaurantId:int}/{categoryId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> DeleteCategory(int restaurantId, int categoryId)
    {
        await _foodService.DeleteCategoryAsync(GetUserId(), restaurantId, categoryId);
        return NoContent();
    }

    // ── POST /api/foods/restaurant/{restaurantId} ─────────────────────
    /// <summary>Owner: add a new food item to their restaurant.</summary>
    [HttpPost("restaurant/{restaurantId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<FoodDto>), 201)]
    public async Task<IActionResult> Create(
        int restaurantId, [FromBody] CreateFoodRequest request)
    {
        var result = await _foodService.CreateAsync(GetUserId(), restaurantId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<FoodDto>.Ok(result, "Food item created."));
    }

    // ── PUT /api/foods/restaurant/{restaurantId}/{foodId} ─────────────
    [HttpPut("restaurant/{restaurantId:int}/{foodId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<FoodDto>), 200)]
    public async Task<IActionResult> Update(
        int restaurantId, int foodId, [FromBody] UpdateFoodRequest request)
    {
        var result = await _foodService.UpdateAsync(GetUserId(), restaurantId, foodId, request);
        return Ok(ApiResponse<FoodDto>.Ok(result, "Food item updated."));
    }

    // ── DELETE /api/foods/restaurant/{restaurantId}/{foodId} ──────────
    [HttpDelete("restaurant/{restaurantId:int}/{foodId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(int restaurantId, int foodId)
    {
        await _foodService.DeleteAsync(GetUserId(), restaurantId, foodId);
        return NoContent();
    }

    // ── PATCH /api/foods/restaurant/{restaurantId}/{foodId}/toggle ────
    [HttpPatch("restaurant/{restaurantId:int}/{foodId:int}/toggle")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<FoodDto>), 200)]
    public async Task<IActionResult> ToggleAvailability(int restaurantId, int foodId)
    {
        await _foodService.ToggleAvailabilityAsync(GetUserId(), restaurantId, foodId);
        return Ok(ApiResponse.OkNoData("Food availability toggled."));
    }

    // ── POST /api/foods/restaurant/{restaurantId}/{foodId}/images ─────
    [HttpPost("restaurant/{restaurantId:int}/{foodId:int}/images")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> UploadImage(
        int restaurantId, int foodId,
        IFormFile file,
        [FromQuery] bool isPrimary = false)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided."));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.Fail("Image must be smaller than 5 MB."));

        await using var stream = file.OpenReadStream();
        var url = await _foodService.UploadImageAsync(
            GetUserId(), restaurantId, foodId, stream, file.FileName, isPrimary);
        return Ok(ApiResponse<object>.Ok(new { imageUrl = url }));
    }

    // ── DELETE /api/foods/restaurant/{restaurantId}/{foodId}/images/{imageId}
    [HttpDelete("restaurant/{restaurantId:int}/{foodId:int}/images/{imageId:int}")]
    [Authorize(Policy = "OwnerOnly")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> DeleteImage(int restaurantId, int foodId, int imageId)
    {
        await _foodService.DeleteImageAsync(GetUserId(), restaurantId, foodId, imageId);
        return NoContent();
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
}
