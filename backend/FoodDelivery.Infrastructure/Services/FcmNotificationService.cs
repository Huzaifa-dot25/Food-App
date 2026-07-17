using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Notification = FoodDelivery.Domain.Entities.Notification;

namespace FoodDelivery.Infrastructure.Services;

public class FcmNotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<FcmNotificationService> _logger;

    public FcmNotificationService(AppDbContext context, ILogger<FcmNotificationService> logger)
    {
        _context = context;
        _logger  = logger;
    }

    public async Task SendPushAsync(string fcmToken, string title, string body,
        Dictionary<string, string>? data = null)
    {
        if (string.IsNullOrWhiteSpace(fcmToken)) return;

        try
        {
            var message = new Message
            {
                Token = fcmToken,
                Notification = new FirebaseAdmin.Messaging.Notification
                {
                    Title = title,
                    Body  = body
                },
                Data = data ?? new Dictionary<string, string>()
            };

            await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "FCM push failed for token {Token}", fcmToken[..10]);
        }
    }

    public async Task SendAndSaveAsync(int userId, string title, string body,
        NotificationType type, int? referenceId = null)
    {
        // Save to DB
        var notification = new Notification
        {
            UserId      = userId,
            Title       = title,
            Body        = body,
            Type        = type,
            ReferenceId = referenceId,
            IsRead      = false
        };
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();

        // Send push if user has FCM token
        var user = await _context.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (!string.IsNullOrWhiteSpace(user?.FcmToken))
        {
            await SendPushAsync(user.FcmToken, title, body,
                referenceId.HasValue
                    ? new Dictionary<string, string> { { "referenceId", referenceId.ToString()! } }
                    : null);
        }
    }
}
