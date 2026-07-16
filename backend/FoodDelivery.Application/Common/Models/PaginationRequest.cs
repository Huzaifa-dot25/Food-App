namespace FoodDelivery.Application.Common.Models;

/// <summary>Query-string pagination parameters shared by all list endpoints.</summary>
public class PaginationRequest
{
    private int _pageSize = 20;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, 100); // max 100 per page
    }
}
