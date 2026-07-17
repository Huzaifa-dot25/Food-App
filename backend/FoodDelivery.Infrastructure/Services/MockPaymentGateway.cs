using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.DTOs.Payment;

namespace FoodDelivery.Infrastructure.Services;

/// <summary>
/// Sandbox payment gateway — always succeeds. Replace with a real
/// payment provider (Stripe, PayStack, etc.) in production.
/// </summary>
public class MockPaymentGateway : IPaymentService
{
    public Task<PaymentResultDto> ProcessCardPaymentAsync(ProcessPaymentRequest request)
    {
        // Simulate network delay
        var result = new PaymentResultDto
        {
            IsSuccess = true,
            TransactionReference = $"TXN-{Guid.NewGuid():N}".ToUpper()[..20]
        };
        return Task.FromResult(result);
    }
}
