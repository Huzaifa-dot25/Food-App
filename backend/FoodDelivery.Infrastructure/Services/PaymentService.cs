using AutoMapper;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.DTOs.Payment;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using IAppPaymentService = FoodDelivery.Application.Services.Interfaces.IPaymentService;
using IInfraPaymentService = FoodDelivery.Application.Common.Interfaces.IPaymentService;

namespace FoodDelivery.Infrastructure.Services;

public class PaymentService : IAppPaymentService
{
    private readonly AppDbContext        _context;
    private readonly IInfraPaymentService _gateway;
    private readonly IMapper             _mapper;

    public PaymentService(
        AppDbContext context,
        IInfraPaymentService gateway,
        IMapper mapper)
    {
        _context = context;
        _gateway = gateway;
        _mapper  = mapper;
    }

    public async Task<PaymentDto> GetByOrderIdAsync(int orderId)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.OrderId == orderId)
            ?? throw new NotFoundException("Payment for order", orderId);

        return _mapper.Map<PaymentDto>(payment);
    }

    public async Task<PaymentDto> ProcessCardPaymentAsync(
        int customerId, ProcessPaymentRequest request)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.OrderId == request.OrderId)
            ?? throw new NotFoundException("Payment for order", request.OrderId);

        if (payment.Order.CustomerId != customerId)
            throw new UnauthorizedException();

        if (payment.Status == PaymentStatus.Paid)
            throw new DomainException("This order has already been paid.");

        // Call mock gateway
        var result = await _gateway.ProcessCardPaymentAsync(request);

        if (result.IsSuccess)
        {
            payment.Status               = PaymentStatus.Paid;
            payment.TransactionReference = result.TransactionReference;
            payment.PaidAt               = DateTime.UtcNow;
        }
        else
        {
            payment.Status = PaymentStatus.Failed;
        }

        await _context.SaveChangesAsync();
        return _mapper.Map<PaymentDto>(payment);
    }

    public async Task<PaymentDto> MarkCodCollectedAsync(int riderId, int orderId)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.RiderAssignment)
            .FirstOrDefaultAsync(p => p.OrderId == orderId)
            ?? throw new NotFoundException("Payment for order", orderId);

        if (payment.Order.RiderAssignment?.RiderId != riderId)
            throw new UnauthorizedException("You are not assigned to this order.");

        if (payment.Method != PaymentMethod.CashOnDelivery)
            throw new DomainException("This order is not cash on delivery.");

        payment.Status = PaymentStatus.Paid;
        payment.PaidAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return _mapper.Map<PaymentDto>(payment);
    }
}
