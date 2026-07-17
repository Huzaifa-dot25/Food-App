using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Implementations;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using FoodDelivery.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDelivery.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Database ───────────────────────────────────────────────────
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        // UnitOfWork
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // ── JWT Token Service ──────────────────────────────────────────
        services.AddScoped<JwtTokenService>();

        // ── Repositories ───────────────────────────────────────────────
        services.AddScoped<IUserRepository,       UserRepository>();
        services.AddScoped<IRestaurantRepository, RestaurantRepository>();
        services.AddScoped<IFoodRepository,       FoodRepository>();
        services.AddScoped<IOrderRepository,      OrderRepository>();
        services.AddScoped<ICartRepository,       CartRepository>();
        services.AddScoped<IRiderRepository,      RiderRepository>();

        // ── Infrastructure Services (external adapters) ────────────────
        // These implement interfaces defined in Application.Common.Interfaces
        services.AddScoped<INotificationService, FcmNotificationService>();
        services.AddScoped<IEmailService,         EmailService>();
        services.AddScoped<IFileStorageService,   LocalFileStorageService>();
        services.AddScoped<IGeoService,           GeoService>();
        services.AddScoped<IPaymentService,       MockPaymentGateway>();

        // ── Application Services (business logic) ─────────────────────
        // These implement interfaces defined in Application.Services.Interfaces
        services.AddScoped<IAuthService,         AuthService>();
        services.AddScoped<IRestaurantService,   RestaurantService>();
        services.AddScoped<IFoodService,         FoodService>();
        services.AddScoped<ICartService,         CartService>();
        services.AddScoped<IOrderService,        OrderService>();
        services.AddScoped<IPaymentService,      PaymentService>();
        services.AddScoped<IReviewService,       ReviewService>();
        services.AddScoped<IRiderService,        RiderService>();
        services.AddScoped<IAdminService,        AdminService>();
        services.AddScoped<
            Application.Services.Interfaces.INotificationService,
            NotificationService>();

        // ── Caching ────────────────────────────────────────────────────
        services.AddMemoryCache();

        return services;
    }
}
