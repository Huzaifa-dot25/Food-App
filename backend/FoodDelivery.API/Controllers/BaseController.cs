using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers;

/// <summary>
/// Shared helpers for all controllers — avoids repeating
/// the ClaimTypes.NameIdentifier parse in every action.
/// </summary>
[ApiController]
public abstract class BaseController : ControllerBase
{
    protected int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    protected int? GetOptionalUserId()
    {
        var val = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return val is null ? null : int.Parse(val);
    }

    protected bool IsInRole(string role) => User.IsInRole(role);
}
