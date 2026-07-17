using FoodDelivery.Application.Common.Models;
using FoodDelivery.Domain.Exceptions;
using System.Net;
using System.Text.Json;

namespace FoodDelivery.API.Middleware;

/// <summary>
/// Catches all unhandled exceptions and maps them to consistent
/// ApiResponse error envelopes. No raw stack traces are exposed.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next   = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        var (statusCode, message, errors) = exception switch
        {
            Domain.Exceptions.ValidationException ve =>
                (HttpStatusCode.BadRequest,
                 "Validation failed.",
                 (IReadOnlyDictionary<string, string[]>?)ve.Errors),

            NotFoundException =>
                (HttpStatusCode.NotFound,
                 exception.Message,
                 (IReadOnlyDictionary<string, string[]>?)null),

            UnauthorizedException =>
                (HttpStatusCode.Forbidden,
                 exception.Message,
                 (IReadOnlyDictionary<string, string[]>?)null),

            DomainException =>
                (HttpStatusCode.UnprocessableEntity,
                 exception.Message,
                 (IReadOnlyDictionary<string, string[]>?)null),

            _ =>
                (HttpStatusCode.InternalServerError,
                 "An unexpected error occurred. Please try again later.",
                 (IReadOnlyDictionary<string, string[]>?)null)
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)statusCode;

        var response = ApiResponse<object>.Fail(message, errors);
        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
