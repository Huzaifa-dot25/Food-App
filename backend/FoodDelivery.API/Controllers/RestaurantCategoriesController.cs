using FoodDelivery.Application.Common.Models;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/restaurant-categories")]
[Produces("application/json")]
public class RestaurantCategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RestaurantCategoriesController(AppDbContext context) => _context = context;

    // ── GET /api/restaurant-categories ───────────────────────────────
    /// <summary>All top-level cuisine categories (Pizza, Burgers, etc.).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.RestaurantCategories
            .OrderBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.IconUrl,
                c.SortOrder,
                RestaurantCount = c.Restaurants.Count(r =>
                    r.Status == Domain.Enums.RestaurantStatus.Active)
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(categories));
    }
}
