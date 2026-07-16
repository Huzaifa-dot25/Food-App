using FoodDelivery.Application.DTOs.Payment;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IPaymentService
{
    Task<PaymentDto> GetByOrderIdAsync(int orderId);
    Task<PaymentDto> ProcessCardPaymentAsync(int customerId, ProcessPaymentRequest request);
    Task<PaymentDto> MarkCodCollectedAsync(int riderId, int orderId);
}
