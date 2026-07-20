using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Rider;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/riders")]
[Authorize]
[Produces("application/json")]
public class RiderController : ControllerBase
{
    private readonly IRiderService _riderService;
    private readonly AppDbContext  _context;

    public RiderController(IRiderService riderService, AppDbContext context)
    {
        _riderService = riderService;
        _context      = context;
    }

    // ── POST /api/riders/register ─────────────────────────────────────
    /// <summary>Register a rider profile (user must have Rider role).</summary>
    [HttpPost("register")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<RiderDto>), 201)]
    public async Task<IActionResult> Register([FromBody] RiderRegistrationRequest request)
    {
        var result = await _riderService.RegisterAsync(GetUserId(), request);
        return StatusCode(201,
            ApiResponse<RiderDto>.Ok(result, "Rider profile created. Pending admin approval."));
    }

    // ── GET /api/riders/profile ───────────────────────────────────────
    /// <summary>Get the current rider's profile.</summary>
    [HttpGet("profile")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<RiderDto>), 200)]
    public async Task<IActionResult> GetProfile()
    {
        // Resolve riderId from userId
        var riderId = await GetRiderIdAsync();
        var result  = await _riderService.GetProfileAsync(riderId);
        return Ok(ApiResponse<RiderDto>.Ok(result));
    }

    // ── PATCH /api/riders/location ────────────────────────────────────
    /// <summary>Rider: broadcast real-time GPS position.</summary>
    [HttpPatch("location")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<RiderDto>), 200)]
    public async Task<IActionResult> UpdateLocation(
        [FromBody] UpdateRiderLocationRequest request)
    {
        var riderId = await GetRiderIdAsync();
        var result  = await _riderService.UpdateLocationAsync(riderId, request);
        return Ok(ApiResponse<RiderDto>.Ok(result));
    }

    // ── PATCH /api/riders/availability ───────────────────────────────
    /// <summary>Rider: toggle online/offline availability.</summary>
    [HttpPatch("availability")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<RiderDto>), 200)]
    public async Task<IActionResult> ToggleAvailability()
    {
        var riderId = await GetRiderIdAsync();
        var result  = await _riderService.ToggleAvailabilityAsync(riderId);
        return Ok(ApiResponse<RiderDto>.Ok(result,
            result.IsAvailable ? "You are now online." : "You are now offline."));
    }

    // ── Helper ────────────────────────────────────────────────────────
    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    private async Task<int> GetRiderIdAsync()
    {
        var userId = GetUserId();
        var rider  = await _context.Riders.FirstOrDefaultAsync(r => r.UserId == userId);
        if (rider is null)
            throw new Domain.Exceptions.NotFoundException(
                "Rider profile not found. Please register as a rider first.");
        return rider.Id;
    }
}
