using AutoMapper;
using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Notification;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using IAppNotificationService = FoodDelivery.Application.Services.Interfaces.INotificationService;
using IInfraNotificationService = FoodDelivery.Application.Common.Interfaces.INotificationService;

namespace FoodDelivery.Infrastructure.Services;

public class NotificationService : IAppNotificationService
{
    private readonly AppDbContext            _context;
    private readonly IInfraNotificationService _push;
    private readonly IMapper                 _mapper;

    public NotificationService(
        AppDbContext context,
        IInfraNotificationService push,
        IMapper mapper)
    {
        _context = context;
        _push    = push;
        _mapper  = mapper;
    }

    public async Task<PagedResult<NotificationDto>> GetForUserAsync(
        int userId, PaginationRequest pagination)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<NotificationDto>.Create(
            _mapper.Map<IReadOnlyList<NotificationDto>>(items),
            total, pagination.PageNumber, pagination.PageSize);
    }

    public async Task MarkReadAsync(int userId, int notificationId)
    {
        var notif = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId)
            ?? throw new NotFoundException("Notification", notificationId);

        notif.IsRead = true;
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllReadAsync(int userId)
    {
        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task<int> GetUnreadCountAsync(int userId) =>
        await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task SendAsync(SendNotificationRequest request)
    {
        if (!Enum.TryParse<NotificationType>(request.Type, true, out var type))
            type = NotificationType.System;

        await _push.SendAndSaveAsync(
            request.UserId, request.Title, request.Body, type, request.ReferenceId);
    }

    public async Task BroadcastAsync(string title, string body, string? role = null)
    {
        var usersQuery = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(role))
            usersQuery = usersQuery
                .Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));

        var users = await usersQuery
            .Select(u => new { u.Id, u.FcmToken })
            .ToListAsync();

        foreach (var user in users)
        {
            await _push.SendAndSaveAsync(
                user.Id, title, body, NotificationType.System);
        }
    }
}
