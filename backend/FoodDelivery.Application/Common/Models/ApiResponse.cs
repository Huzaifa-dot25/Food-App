namespace FoodDelivery.Application.Common.Models;

/// <summary>
/// Standardised envelope for all API responses.
/// Every endpoint returns this shape so clients have a consistent contract.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }
    public IReadOnlyDictionary<string, string[]>? Errors { get; init; }

    // Factory helpers ────────────────────────────────────────────────

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message, IReadOnlyDictionary<string, string[]>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

/// <summary>Non-generic variant for responses that carry no data payload.</summary>
public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse OkNoData(string message = "Success") =>
        new() { Success = true, Message = message };
}
