using AutoMapper;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Order;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository  _orderRepo;
    private readonly ICartRepository   _cartRepo;
    private readonly IRiderRepository  _riderRepo;
    private readonly AppDbContext      _context;
    private readonly INotificationService _notifService;
    private readonly IMapper           _mapper;

    public OrderService(
        IOrderRepository orderRepo,
        ICartRepository cartRepo,
        IRiderRepository riderRepo,
        AppDbContext context,
        INotificationService notifService,
        IMapper mapper)
    {
        _orderRepo    = orderRepo;
        _cartRepo     = cartRepo;
        _riderRepo    = riderRepo;
        _context      = context;
        _notifService = notifService;
        _mapper       = mapper;
    }

    // ── Create Order ──────────────────────────────────────────────────
    public async Task<OrderDto> CreateAsync(int customerId, CreateOrderRequest request)
    {
        // 1. Load and validate cart
        var cart = await _cartRepo.GetActiveCartAsync(customerId);
        if (cart is null || !cart.Items.Any())
            throw new DomainException("Your cart is empty.");

        // 2. Validate address belongs to customer
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.AddressId && a.UserId == customerId)
            ?? throw new NotFoundException("Address", request.AddressId);

        // 3. Load restaurant
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == cart.RestaurantId!.Value)
            ?? throw new NotFoundException("Restaurant", cart.RestaurantId!);

        // 4. Validate min order
        var subtotal = cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        if (subtotal < restaurant.MinOrderAmount)
            throw new DomainException(
                $"Minimum order amount for this restaurant is ${restaurant.MinOrderAmount:F2}.");

        // 5. Calculate discount
        decimal discount = 0;
        if (cart.CouponId.HasValue && cart.Coupon is not null)
        {
            var coupon = cart.Coupon;
            if (coupon.IsValid)
            {
                discount = coupon.DiscountType == DiscountType.Percentage
                    ? subtotal * coupon.DiscountValue / 100
                    : coupon.DiscountValue;

                if (coupon.MaxDiscountAmount.HasValue)
                    discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);

                coupon.UsedCount++;
            }
        }

        // 6. Build order (all in one DB transaction)
        var orderNumber = await _orderRepo.GenerateOrderNumberAsync();

        var order = new Order
        {
            OrderNumber              = orderNumber,
            CustomerId               = customerId,
            RestaurantId             = restaurant.Id,
            AddressId                = address.Id,
            CouponId                 = cart.CouponId,
            Status                   = OrderStatus.Pending,
            SubTotal                 = subtotal,
            DiscountAmount           = discount,
            DeliveryFee              = restaurant.DeliveryFee,
            TotalAmount              = subtotal - discount + restaurant.DeliveryFee,
            PaymentMethod            = request.PaymentMethod,
            DeliveryInstructions     = request.DeliveryInstructions,
            EstimatedDeliveryMinutes = restaurant.EstimatedDeliveryTimeMinutes
        };

        // 7. Snapshot order items
        foreach (var cartItem in cart.Items)
        {
            var primaryImage = cartItem.Food.Images
                .FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                ?? cartItem.Food.Images.OrderBy(i => i.SortOrder)
                    .FirstOrDefault()?.ImageUrl;

            order.Items.Add(new OrderItem
            {
                FoodId       = cartItem.FoodId,
                FoodName     = cartItem.Food.Name,
                FoodImageUrl = primaryImage,
                UnitPrice    = cartItem.UnitPrice,
                Quantity     = cartItem.Quantity,
                TotalPrice   = cartItem.UnitPrice * cartItem.Quantity
            });
        }

        // 8. Create payment record
        order.Payment = new Payment
        {
            Method = request.PaymentMethod,
            Amount = order.TotalAmount,
            Status = request.PaymentMethod == PaymentMethod.CashOnDelivery
                ? PaymentStatus.Pending
                : PaymentStatus.Pending
        };

        await _orderRepo.AddAsync(order);

        // 9. Clear cart
        _context.CartItems.RemoveRange(cart.Items);
        cart.RestaurantId = null;
        cart.CouponId     = null;

        await _context.SaveChangesAsync();

        // 10. Notify restaurant owner
        var owner = await _context.Restaurants
            .Include(r => r.Owner)
            .Where(r => r.Id == restaurant.Id)
            .Select(r => r.Owner)
            .FirstOrDefaultAsync();

        if (owner is not null)
            await _notifService.SendAndSaveAsync(
                owner.Id,
                "New Order Received!",
                $"Order {orderNumber} — ${order.TotalAmount:F2}",
                NotificationType.NewOrder, order.Id);

        return await BuildOrderDtoAsync(order.Id);
    }

    // ── Get by ID ─────────────────────────────────────────────────────
    public async Task<OrderDto> GetByIdAsync(int orderId, int requestingUserId)
    {
        var order = await _orderRepo.GetWithDetailsAsync(orderId)
            ?? throw new NotFoundException("Order", orderId);

        // Only customer, restaurant owner or rider of this order can view it
        var rider = order.RiderAssignment?.Rider;
        var isAuthorized = order.CustomerId == requestingUserId
            || order.Restaurant.OwnerId == requestingUserId
            || rider?.UserId == requestingUserId;

        if (!isAuthorized)
            throw new UnauthorizedException();

        return await BuildOrderDtoAsync(orderId);
    }

    // ── Order History ─────────────────────────────────────────────────
    public async Task<PagedResult<OrderSummaryDto>> GetHistoryAsync(
        int customerId, OrderFilterRequest filter)
    {
        var (items, total) = await _orderRepo.GetByCustomerAsync(customerId, filter);
        var dtos = _mapper.Map<IReadOnlyList<OrderSummaryDto>>(items);
        return PagedResult<OrderSummaryDto>.Create(dtos, total,
            filter.PageNumber, filter.PageSize);
    }

    // ── Cancel ────────────────────────────────────────────────────────
    public async Task<OrderDto> CancelAsync(int customerId, int orderId,
        CancelOrderRequest request)
    {
        var order = await _orderRepo.GetWithDetailsAsync(orderId)
            ?? throw new NotFoundException("Order", orderId);

        if (order.CustomerId != customerId)
            throw new UnauthorizedException();

        var cancellableStatuses = new[]
            { OrderStatus.Pending, OrderStatus.Confirmed };

        if (!cancellableStatuses.Contains(order.Status))
            throw new DomainException(
                "This order can no longer be cancelled.");

        order.Status             = OrderStatus.Cancelled;
        order.CancelledAt        = DateTime.UtcNow;
        order.CancellationReason = request.Reason;
        await _context.SaveChangesAsync();

        await _notifService.SendAndSaveAsync(
            customerId,
            "Order Cancelled",
            $"Your order {order.OrderNumber} has been cancelled.",
            NotificationType.OrderUpdate, orderId);

        return await BuildOrderDtoAsync(orderId);
    }

    // ── Reorder ───────────────────────────────────────────────────────
    public async Task<OrderDto> ReorderAsync(int customerId, int orderId)
    {
        var original = await _orderRepo.GetWithDetailsAsync(orderId)
            ?? throw new NotFoundException("Order", orderId);

        if (original.CustomerId != customerId) throw new UnauthorizedException();

        // Re-create order from original items
        var createRequest = new CreateOrderRequest
        {
            AddressId     = original.AddressId,
            PaymentMethod = original.PaymentMethod
        };

        // First repopulate cart
        var cart = await _cartRepo.GetActiveCartAsync(customerId)
            ?? new Cart { CustomerId = customerId };

        cart.RestaurantId = original.RestaurantId;
        cart.Items.Clear();

        foreach (var item in original.Items)
        {
            var food = await _context.Foods.FindAsync(item.FoodId);
            if (food is null || !food.IsAvailable) continue;

            cart.Items.Add(new CartItem
            {
                FoodId    = item.FoodId,
                Quantity  = item.Quantity,
                UnitPrice = food.EffectivePrice
            });
        }

        if (cart.Id == 0) await _cartRepo.AddAsync(cart);
        await _context.SaveChangesAsync();

        return await CreateAsync(customerId, createRequest);
    }

    // ── Tracking ──────────────────────────────────────────────────────
    public async Task<RiderTrackingDto?> GetTrackingAsync(int orderId, int requestingUserId)
    {
        var order = await _orderRepo.GetWithDetailsAsync(orderId)
            ?? throw new NotFoundException("Order", orderId);

        if (order.CustomerId != requestingUserId) throw new UnauthorizedException();

        var rider = order.RiderAssignment?.Rider;
        return rider is null ? null : _mapper.Map<RiderTrackingDto>(rider);
    }

    // ── Restaurant Owner ──────────────────────────────────────────────
    public async Task<PagedResult<OrderSummaryDto>> GetRestaurantOrdersAsync(
        int ownerId, int restaurantId, OrderFilterRequest filter)
    {
        var owned = await _context.Restaurants
            .AnyAsync(r => r.Id == restaurantId && r.OwnerId == ownerId);
        if (!owned) throw new UnauthorizedException();

        var (items, total) = await _orderRepo.GetByRestaurantAsync(restaurantId, filter);
        var dtos = _mapper.Map<IReadOnlyList<OrderSummaryDto>>(items);
        return PagedResult<OrderSummaryDto>.Create(dtos, total,
            filter.PageNumber, filter.PageSize);
    }

    public async Task<OrderDto> UpdateStatusAsync(int ownerId, int orderId,
        UpdateOrderStatusRequest request)
    {
        var order = await _orderRepo.GetWithDetailsAsync(orderId)
            ?? throw new NotFoundException("Order", orderId);

        if (order.Restaurant.OwnerId != ownerId) throw new UnauthorizedException();

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
            throw new Domain.Exceptions.ValidationException("Status", "Invalid order status.");

        order.Status = newStatus;
        if (newStatus == OrderStatus.Confirmed) order.ConfirmedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Notify customer
        var statusMsg = newStatus switch
        {
            OrderStatus.Confirmed      => "Your order has been confirmed!",
            OrderStatus.Preparing      => "Your order is being prepared.",
            OrderStatus.ReadyForPickup => "Your order is ready for pickup.",
            OrderStatus.OutForDelivery => "Your order is on the way!",
            OrderStatus.Delivered      => "Your order has been delivered. Enjoy!",
            _ => $"Your order status changed to {newStatus}."
        };

        await _notifService.SendAndSaveAsync(
            order.CustomerId, "Order Update", statusMsg,
            NotificationType.OrderUpdate, orderId);

        return await BuildOrderDtoAsync(orderId);
    }

    public async Task<OrderDto> AssignRiderAsync(int ownerId, int orderId, int riderId)
    {
        var order = await _orderRepo.GetWithDetailsAsync(orderId)
            ?? throw new NotFoundException("Order", orderId);

        if (order.Restaurant.OwnerId != ownerId) throw new UnauthorizedException();

        var rider = await _riderRepo.GetWithDetailsAsync(riderId)
            ?? throw new NotFoundException("Rider", riderId);

        if (order.RiderAssignment != null)
            throw new DomainException("A rider is already assigned to this order.");

        var assignment = new RiderAssignment
        {
            OrderId    = orderId,
            RiderId    = riderId,
            AssignedAt = DateTime.UtcNow
        };

        await _context.RiderAssignments.AddAsync(assignment);
        await _context.SaveChangesAsync();

        // Notify rider
        await _notifService.SendAndSaveAsync(
            rider.UserId,
            "New Delivery Request",
            $"You have a new delivery for order {order.OrderNumber}.",
            NotificationType.DeliveryRequest, orderId);

        return await BuildOrderDtoAsync(orderId);
    }

    // ── Rider ─────────────────────────────────────────────────────────
    public async Task<IReadOnlyList<RiderDeliveryDto>> GetActiveDeliveriesAsync(int riderId)
    {
        var assignments = await _context.RiderAssignments
            .Include(a => a.Order).ThenInclude(o => o.Restaurant)
            .Include(a => a.Order).ThenInclude(o => o.Customer)
            .Include(a => a.Order).ThenInclude(o => o.Address)
            .Where(a => a.RiderId == riderId && a.IsAccepted && a.DeliveredAt == null)
            .ToListAsync();

        return _mapper.Map<IReadOnlyList<RiderDeliveryDto>>(assignments);
    }

    public async Task<RiderDeliveryDto> AcceptDeliveryAsync(int riderId, int assignmentId)
    {
        var assignment = await GetRiderAssignmentAsync(riderId, assignmentId);
        assignment.IsAccepted = true;
        assignment.AcceptedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<RiderDeliveryDto>(assignment);
    }

    public async Task<RiderDeliveryDto> RejectDeliveryAsync(int riderId, int assignmentId)
    {
        var assignment = await GetRiderAssignmentAsync(riderId, assignmentId);
        assignment.IsRejected = true;
        await _context.SaveChangesAsync();
        return _mapper.Map<RiderDeliveryDto>(assignment);
    }

    public async Task<OrderDto> ConfirmPickupAsync(int riderId, int assignmentId)
    {
        var assignment = await GetRiderAssignmentAsync(riderId, assignmentId);
        assignment.PickedUpAt       = DateTime.UtcNow;
        assignment.Order.Status     = OrderStatus.OutForDelivery;
        await _context.SaveChangesAsync();

        await _notifService.SendAndSaveAsync(
            assignment.Order.CustomerId,
            "Order Picked Up",
            "Your order has been picked up and is on the way!",
            NotificationType.OrderUpdate, assignment.OrderId);

        return await BuildOrderDtoAsync(assignment.OrderId);
    }

    public async Task<OrderDto> ConfirmDeliveryAsync(int riderId, int assignmentId)
    {
        var assignment = await GetRiderAssignmentAsync(riderId, assignmentId);
        assignment.DeliveredAt          = DateTime.UtcNow;
        assignment.Order.Status         = OrderStatus.Delivered;
        assignment.Order.DeliveredAt    = DateTime.UtcNow;

        // Update rider stats
        var rider = await _riderRepo.GetByIdAsync(riderId)!;
        if (rider != null)
        {
            rider.TotalDeliveries++;
            rider.TotalEarnings += assignment.Order.DeliveryFee;
        }

        // Mark COD payment as paid
        if (assignment.Order.Payment?.Method == PaymentMethod.CashOnDelivery)
        {
            assignment.Order.Payment.Status = PaymentStatus.Paid;
            assignment.Order.Payment.PaidAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        await _notifService.SendAndSaveAsync(
            assignment.Order.CustomerId,
            "Order Delivered!",
            $"Your order {assignment.Order.OrderNumber} has been delivered. Enjoy your meal!",
            NotificationType.OrderUpdate, assignment.OrderId);

        return await BuildOrderDtoAsync(assignment.OrderId);
    }

    public async Task<PagedResult<RiderDeliveryDto>> GetRiderHistoryAsync(
        int riderId, PaginationRequest pagination)
    {
        var query = _context.RiderAssignments
            .Include(a => a.Order).ThenInclude(o => o.Restaurant)
            .Include(a => a.Order).ThenInclude(o => o.Customer)
            .Include(a => a.Order).ThenInclude(o => o.Address)
            .Where(a => a.RiderId == riderId && a.DeliveredAt != null)
            .OrderByDescending(a => a.DeliveredAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<RiderDeliveryDto>.Create(
            _mapper.Map<IReadOnlyList<RiderDeliveryDto>>(items),
            total, pagination.PageNumber, pagination.PageSize);
    }

    // ── Admin ─────────────────────────────────────────────────────────
    public async Task<PagedResult<OrderSummaryDto>> GetAllOrdersAsync(OrderFilterRequest filter)
    {
        var (items, total) = await _orderRepo.GetAllAsync(filter);
        var dtos = _mapper.Map<IReadOnlyList<OrderSummaryDto>>(items);
        return PagedResult<OrderSummaryDto>.Create(dtos, total,
            filter.PageNumber, filter.PageSize);
    }

    // ── Private Helpers ───────────────────────────────────────────────
    private async Task<OrderDto> BuildOrderDtoAsync(int orderId)
    {
        var order = await _orderRepo.GetWithDetailsAsync(orderId)!;
        var dto   = _mapper.Map<OrderDto>(order!);

        var cancellable = new[] { OrderStatus.Pending, OrderStatus.Confirmed };
        dto.CanCancel = cancellable.Contains(order!.Status);
        dto.CanReview = order.Status == OrderStatus.Delivered && order.Review == null;

        return dto;
    }

    private async Task<RiderAssignment> GetRiderAssignmentAsync(int riderId, int assignmentId)
    {
        var assignment = await _context.RiderAssignments
            .Include(a => a.Order).ThenInclude(o => o.Restaurant)
            .Include(a => a.Order).ThenInclude(o => o.Customer)
            .Include(a => a.Order).ThenInclude(o => o.Address)
            .Include(a => a.Order).ThenInclude(o => o.Payment)
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new NotFoundException("RiderAssignment", assignmentId);

        if (assignment.RiderId != riderId) throw new UnauthorizedException();
        return assignment;
    }
}
