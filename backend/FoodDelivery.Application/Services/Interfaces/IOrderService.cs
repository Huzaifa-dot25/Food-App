using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Order;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IOrderService
{
    // Customer
    Task<OrderDto> CreateAsync(int customerId, CreateOrderRequest request);
    Task<OrderDto> GetByIdAsync(int orderId, int requestingUserId);
    Task<PagedResult<OrderSummaryDto>> GetHistoryAsync(int customerId, OrderFilterRequest filter);
    Task<OrderDto> CancelAsync(int customerId, int orderId, CancelOrderRequest request);
    Task<OrderDto> ReorderAsync(int customerId, int orderId);
    Task<RiderTrackingDto?> GetTrackingAsync(int orderId, int requestingUserId);

    // Restaurant owner
    Task<PagedResult<OrderSummaryDto>> GetRestaurantOrdersAsync(int ownerId, int restaurantId, OrderFilterRequest filter);
    Task<OrderDto> UpdateStatusAsync(int ownerId, int orderId, UpdateOrderStatusRequest request);
    Task<OrderDto> AssignRiderAsync(int ownerId, int orderId, int riderId);

    // Rider
    Task<IReadOnlyList<RiderDeliveryDto>> GetActiveDeliveriesAsync(int riderId);
    Task<RiderDeliveryDto> AcceptDeliveryAsync(int riderId, int assignmentId);
    Task<RiderDeliveryDto> RejectDeliveryAsync(int riderId, int assignmentId);
    Task<OrderDto> ConfirmPickupAsync(int riderId, int assignmentId);
    Task<OrderDto> ConfirmDeliveryAsync(int riderId, int assignmentId);
    Task<PagedResult<RiderDeliveryDto>> GetRiderHistoryAsync(int riderId, PaginationRequest pagination);

    // Admin
    Task<PagedResult<OrderSummaryDto>> GetAllOrdersAsync(OrderFilterRequest filter);
}
