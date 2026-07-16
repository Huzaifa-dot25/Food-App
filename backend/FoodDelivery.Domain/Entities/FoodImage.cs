namespace FoodDelivery.Domain.Entities;

public class FoodImage : BaseEntity
{
    public int FoodId { get; set; }
    public Food Food { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; } = false;
    public int SortOrder { get; set; } = 0;
}
