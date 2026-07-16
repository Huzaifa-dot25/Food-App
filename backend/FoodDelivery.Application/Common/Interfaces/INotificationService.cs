using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Application.Common.Interfaces;

public interface INotificationService
{
    /// <summary>Send a push notification via Firebase FCM.</summary>
    Task SendPushAsync(string fcmToken, string title, string body, Dictionary<string, string>? data = null);

    /// <summary>Persist a notification record and optionally send push.</summary>
    Task SendAndSaveAsync(int userId, string title, string body,
        NotificationType type, int? referenceId = null);
}
