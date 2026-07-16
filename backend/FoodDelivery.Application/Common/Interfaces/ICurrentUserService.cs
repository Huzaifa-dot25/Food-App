namespace FoodDelivery.Application.Common.Interfaces;

/// <summary>
/// Provides access to the authenticated user's identity within the request scope.
/// Implemented in the API layer using HttpContext.
/// </summary>
public interface ICurrentUserService
{
    int UserId { get; }
    string Email { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsInRole(string role);
}
