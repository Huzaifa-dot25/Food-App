using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Cart;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize(Policy = "CustomerOnly")]
[Produces("application/json")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService) => _cartService = cartService;

    // ── GET /api/cart ────────────────────────────────────────────────
    /// <summary>Get the current customer's active cart.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<CartDto>), 200)]
    public async Task<IActionResult> GetCart()
    {
        var result = await _cartService.GetCartAsync(GetUserId());
        return Ok(ApiResponse<CartDto>.Ok(result));
    }

    // ── POST /api/cart/items ─────────────────────────────────────────
    /// <summary>Add a food item to the cart. Creates cart if none exists.</summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(ApiResponse<CartDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request)
    {
        var result = await _cartService.AddItemAsync(GetUserId(), request);
        return Ok(ApiResponse<CartDto>.Ok(result, "Item added to cart."));
    }

    // ── PUT /api/cart/items/{itemId} ─────────────────────────────────
    /// <summary>Update quantity. Set quantity to 0 to remove the item.</summary>
    [HttpPut("items/{itemId:int}")]
    [ProducesResponseType(typeof(ApiResponse<CartDto>), 200)]
    public async Task<IActionResult> UpdateItem(int itemId, [FromBody] UpdateCartItemRequest request)
    {
        var result = await _cartService.UpdateItemAsync(GetUserId(), itemId, request);
        return Ok(ApiResponse<CartDto>.Ok(result, "Cart updated."));
    }

    // ── DELETE /api/cart/items/{itemId} ──────────────────────────────
    [HttpDelete("items/{itemId:int}")]
    [ProducesResponseType(typeof(ApiResponse<CartDto>), 200)]
    public async Task<IActionResult> RemoveItem(int itemId)
    {
        var result = await _cartService.RemoveItemAsync(GetUserId(), itemId);
        return Ok(ApiResponse<CartDto>.Ok(result, "Item removed from cart."));
    }

    // ── POST /api/cart/coupon ────────────────────────────────────────
    [HttpPost("coupon")]
    [ProducesResponseType(typeof(ApiResponse<CartDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponRequest request)
    {
        var result = await _cartService.ApplyCouponAsync(GetUserId(), request);
        return Ok(ApiResponse<CartDto>.Ok(result, "Coupon applied."));
    }

    // ── DELETE /api/cart/coupon ──────────────────────────────────────
    [HttpDelete("coupon")]
    [ProducesResponseType(typeof(ApiResponse<CartDto>), 200)]
    public async Task<IActionResult> RemoveCoupon()
    {
        var result = await _cartService.RemoveCouponAsync(GetUserId());
        return Ok(ApiResponse<CartDto>.Ok(result, "Coupon removed."));
    }

    // ── DELETE /api/cart ─────────────────────────────────────────────
    [HttpDelete]
    [ProducesResponseType(204)]
    public async Task<IActionResult> ClearCart()
    {
        await _cartService.ClearCartAsync(GetUserId());
        return NoContent();
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
}
