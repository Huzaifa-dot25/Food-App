using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Notification;

namespace FoodDelivery.Application.Services.Interfaces;

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetForUserAsync(int userId, PaginationRequest pagination);
    Task MarkReadAsync(int userId, int notificationId);
    Task MarkAllReadAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task SendAsync(SendNotificationRequest request);
    Task BroadcastAsync(string title, string body, string? role = null);
}
