using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FoodDelivery.API.Hubs;

/// <summary>
/// SignalR hub for real-time order tracking.
/// Clients subscribe to a group named "order_{orderId}" and receive
/// status updates and rider location pushes.
/// </summary>
[Authorize]
public class OrderTrackingHub : Hub
{
    private readonly ILogger<OrderTrackingHub> _logger;

    public OrderTrackingHub(ILogger<OrderTrackingHub> logger)
    {
        _logger = logger;
    }

    /// <summary>Customer calls this to start tracking a specific order.</summary>
    public async Task SubscribeToOrder(int orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order_{orderId}");
        _logger.LogInformation("Client {ConnectionId} subscribed to order {OrderId}",
            Context.ConnectionId, orderId);
    }

    /// <summary>Rider calls this to broadcast their location to the customer.</summary>
    public async Task UpdateRiderLocation(int orderId, double latitude, double longitude)
    {
        await Clients.Group($"order_{orderId}")
            .SendAsync("RiderLocationUpdated", new { latitude, longitude });
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client {ConnectionId} disconnected", Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
}
