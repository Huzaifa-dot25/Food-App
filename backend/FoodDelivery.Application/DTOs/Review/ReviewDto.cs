namespace FoodDelivery.Application.DTOs.Review;

public class ReviewDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int RestaurantId { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhoto { get; set; }

    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? OwnerReply { get; set; }
    public DateTime? OwnerRepliedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewRequest
{
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReplyToReviewRequest
{
    public string Reply { get; set; } = string.Empty;
}
