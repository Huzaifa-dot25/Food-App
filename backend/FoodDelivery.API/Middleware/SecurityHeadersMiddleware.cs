namespace FoodDelivery.API.Middleware;

/// <summary>
/// Adds security-related HTTP response headers to every response.
/// Mitigates XSS, clickjacking, MIME sniffing, and information disclosure.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Prevent MIME type sniffing
        headers["X-Content-Type-Options"] = "nosniff";

        // Prevent clickjacking
        headers["X-Frame-Options"] = "DENY";

        // Force HTTPS for 1 year (only add in production)
        if (!context.Request.IsHttps is false)
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

        // Basic XSS protection (for older browsers)
        headers["X-XSS-Protection"] = "1; mode=block";

        // Referrer policy
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Content Security Policy — adjust for your CDN/assets
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self'; " +
            "script-src 'self'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "connect-src 'self' wss:;";

        // Permissions policy — disable unnecessary browser features
        headers["Permissions-Policy"] =
            "camera=(), microphone=(), geolocation=(self), payment=()";

        // Remove server identity headers
        headers.Remove("Server");
        headers.Remove("X-Powered-By");
        headers.Remove("X-AspNet-Version");
        headers.Remove("X-AspNetMvc-Version");

        await _next(context);
    }
}
