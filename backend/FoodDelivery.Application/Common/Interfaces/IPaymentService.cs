using FoodDelivery.Application.DTOs.Payment;

namespace FoodDelivery.Application.Common.Interfaces;

public interface IPaymentService
{
    /// <summary>
    /// Process a mock card payment.
    /// In sandbox mode this always succeeds and returns a fake transaction reference.
    /// </summary>
    Task<PaymentResultDto> ProcessCardPaymentAsync(ProcessPaymentRequest request);
}
