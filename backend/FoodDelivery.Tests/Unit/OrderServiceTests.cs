using AutoMapper;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.DTOs.Order;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using FoodDelivery.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace FoodDelivery.Tests.Unit;

public class OrderServiceTests
{
    private readonly AppDbContext              _db;
    private readonly Mock<IOrderRepository>   _orderRepoMock  = new();
    private readonly Mock<ICartRepository>    _cartRepoMock   = new();
    private readonly Mock<IRiderRepository>   _riderRepoMock  = new();
    private readonly Mock<INotificationService> _notifMock    = new();
    private readonly Mock<IMapper>             _mapperMock    = new();
    private readonly OrderService              _orderService;

    public OrderServiceTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(opts);

        _orderService = new OrderService(
            _orderRepoMock.Object,
            _cartRepoMock.Object,
            _riderRepoMock.Object,
            _db,
            _notifMock.Object,
            _mapperMock.Object
        );
    }

    // ── Cancel Tests ───────────────────────────────────────────────

    [Theory]
    [InlineData(OrderStatus.Pending)]
    [InlineData(OrderStatus.Confirmed)]
    public async Task CancelOrder_InCancellableStatus_Succeeds(OrderStatus status)
    {
        // Arrange
        const int customerId = 1;
        const int orderId    = 42;

        var restaurant = new Restaurant
        {
            Id = 1, Name = "Test", OwnerId = 2, CategoryId = 1,
            Street = "s", City = "c", State = "st", ZipCode = "z"
        };
        var order = new Order
        {
            Id           = orderId,
            CustomerId   = customerId,
            RestaurantId = 1,
            Restaurant   = restaurant,
            AddressId    = 1,
            Status       = status,
            OrderNumber  = "ORD-20260101-0001",
            PaymentMethod= PaymentMethod.CashOnDelivery
        };

        _db.Restaurants.Add(restaurant);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        _orderRepoMock.Setup(r => r.GetWithDetailsAsync(orderId))
            .ReturnsAsync(order);

        _notifMock.Setup(n => n.SendAndSaveAsync(
            It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<NotificationType>(), It.IsAny<int?>()))
            .Returns(Task.CompletedTask);

        _mapperMock.Setup(m => m.Map<OrderDto>(It.IsAny<Order>()))
            .Returns(new OrderDto
            {
                Id     = orderId,
                Status = "Cancelled"
            });

        // Act
        var result = await _orderService.CancelAsync(customerId, orderId,
            new CancelOrderRequest { Reason = "Changed my mind" });

        // Assert
        result.Should().NotBeNull();
        order.Status.Should().Be(OrderStatus.Cancelled);
        order.CancellationReason.Should().Be("Changed my mind");
    }

    [Theory]
    [InlineData(OrderStatus.Preparing)]
    [InlineData(OrderStatus.OutForDelivery)]
    [InlineData(OrderStatus.Delivered)]
    public async Task CancelOrder_InNonCancellableStatus_ThrowsDomainException(OrderStatus status)
    {
        // Arrange
        const int customerId = 1;
        const int orderId    = 43;

        var restaurant = new Restaurant
        {
            Id = 1, Name = "Test", OwnerId = 2, CategoryId = 1,
            Street = "s", City = "c", State = "st", ZipCode = "z"
        };
        var order = new Order
        {
            Id           = orderId,
            CustomerId   = customerId,
            RestaurantId = 1,
            Restaurant   = restaurant,
            Status       = status,
            OrderNumber  = "ORD-TEST",
            PaymentMethod= PaymentMethod.CashOnDelivery
        };

        _db.Restaurants.Add(restaurant);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        _orderRepoMock.Setup(r => r.GetWithDetailsAsync(orderId))
            .ReturnsAsync(order);

        // Act
        Func<Task> act = async () => await _orderService.CancelAsync(customerId, orderId,
            new CancelOrderRequest { Reason = "Too late" });

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("*no longer be cancelled*");
    }

    [Fact]
    public async Task CancelOrder_ByWrongCustomer_ThrowsUnauthorizedException()
    {
        // Arrange
        var restaurant = new Restaurant
        {
            Id = 1, Name = "Test", OwnerId = 2, CategoryId = 1,
            Street = "s", City = "c", State = "st", ZipCode = "z"
        };
        var order = new Order
        {
            Id           = 50,
            CustomerId   = 999,  // belongs to user 999
            RestaurantId = 1,
            Restaurant   = restaurant,
            Status       = OrderStatus.Pending,
            OrderNumber  = "ORD-TEST2",
            PaymentMethod= PaymentMethod.CashOnDelivery
        };

        _db.Restaurants.Add(restaurant);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        _orderRepoMock.Setup(r => r.GetWithDetailsAsync(50)).ReturnsAsync(order);

        // Act — user 1 tries to cancel user 999's order
        Func<Task> act = async () => await _orderService.CancelAsync(1, 50,
            new CancelOrderRequest { Reason = "Hack" });

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();
    }
}
