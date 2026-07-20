using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Payment;
using FoodDelivery.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
[Produces("application/json")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
        => _paymentService = paymentService;

    // ── GET /api/payments/order/{orderId} ─────────────────────────────
    /// <summary>Get payment details for a specific order.</summary>
    [HttpGet("order/{orderId:int}")]
    [ProducesResponseType(typeof(ApiResponse<PaymentDto>), 200)]
    public async Task<IActionResult> GetByOrder(int orderId)
    {
        var result = await _paymentService.GetByOrderIdAsync(orderId);
        return Ok(ApiResponse<PaymentDto>.Ok(result));
    }

    // ── POST /api/payments/card ───────────────────────────────────────
    /// <summary>Customer: pay with mock card (sandbox).</summary>
    [HttpPost("card")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType(typeof(ApiResponse<PaymentDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> PayWithCard([FromBody] ProcessPaymentRequest request)
    {
        var result = await _paymentService.ProcessCardPaymentAsync(GetUserId(), request);
        return Ok(ApiResponse<PaymentDto>.Ok(result,
            result.Status == "Paid" ? "Payment successful." : "Payment failed."));
    }

    // ── POST /api/payments/cod/{orderId}/collect ──────────────────────
    /// <summary>Rider: confirm cash was collected on delivery.</summary>
    [HttpPost("cod/{orderId:int}/collect")]
    [Authorize(Policy = "RiderOnly")]
    [ProducesResponseType(typeof(ApiResponse<PaymentDto>), 200)]
    public async Task<IActionResult> CollectCod(int orderId)
    {
        var result = await _paymentService.MarkCodCollectedAsync(GetUserId(), orderId);
        return Ok(ApiResponse<PaymentDto>.Ok(result, "Cash collection confirmed."));
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
}
