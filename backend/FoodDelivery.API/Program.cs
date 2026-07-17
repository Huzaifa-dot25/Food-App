using FoodDelivery.API.Extensions;
using FoodDelivery.API.Hubs;
using FoodDelivery.API.Middleware;
using FoodDelivery.Application.Common.Mappings;
using FoodDelivery.Application.Validators;
using FoodDelivery.Infrastructure;
using FirebaseAdmin;
using FluentValidation;
using FluentValidation.AspNetCore;
using Google.Apis.Auth.OAuth2;
using Serilog;
using Serilog.Events;

// ── Bootstrap Serilog early ──────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File("logs/fooddelivery-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30)
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Food Delivery API...");

    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ──────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, cfg) => cfg
        .ReadFrom.Configuration(ctx.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File("logs/fooddelivery-.log", rollingInterval: RollingInterval.Day));

    // ── Controllers + JSON ───────────────────────────────────────────────
    builder.Services.AddControllers()
        .AddJsonOptions(o =>
        {
            o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            o.JsonSerializerOptions.DefaultIgnoreCondition =
                System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        });

    // ── FluentValidation ─────────────────────────────────────────────────
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

    // ── AutoMapper ───────────────────────────────────────────────────────
    builder.Services.AddAutoMapper(typeof(AutoMapperProfile).Assembly);

    // ── Infrastructure (DB, Repos, Services) ─────────────────────────────
    builder.Services.AddInfrastructure(builder.Configuration);

    // ── JWT Auth + Role Policies ─────────────────────────────────────────
    builder.Services.AddJwtAuthentication(builder.Configuration);
    builder.Services.AddRolePolicies();

    // ── Current User (HttpContext claim reader) ───────────────────────────
    builder.Services.AddCurrentUserService();

    // ── SignalR ──────────────────────────────────────────────────────────
    builder.Services.AddSignalR();

    // ── Swagger ──────────────────────────────────────────────────────────
    builder.Services.AddSwagger();
    builder.Services.AddEndpointsApiExplorer();

    // ── Rate Limiting ─────────────────────────────────────────────────────
    builder.Services.AddRateLimiting(builder.Configuration);

    // ── CORS ─────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowMobileApp", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    // ── Firebase Admin SDK ───────────────────────────────────────────────
    var credPath = builder.Configuration["FirebaseSettings:CredentialFilePath"];
    if (File.Exists(credPath))
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(credPath)
        });
    }
    else
    {
        Log.Warning("Firebase credential file not found at {Path}. Push notifications disabled.", credPath);
    }

    // ── Static files (uploads) ───────────────────────────────────────────
    builder.Services.AddDirectoryBrowser();

    var app = builder.Build();

    // ── Middleware pipeline ───────────────────────────────────────────────
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseMiddleware<RequestLoggingMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Food Delivery API v1");
            c.RoutePrefix = string.Empty; // Swagger at root
        });
    }

    app.UseHttpsRedirection();
    app.UseStaticFiles();
    app.UseCors("AllowMobileApp");
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // SignalR hub endpoint
    app.MapHub<OrderTrackingHub>("/hubs/order-tracking");

    // Health check endpoint
    app.MapGet("/health", () => Results.Ok(new
    {
        status    = "healthy",
        timestamp = DateTime.UtcNow,
        version   = "1.0.0"
    }));

    Log.Information("Food Delivery API started on {Urls}", string.Join(", ", app.Urls));
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
