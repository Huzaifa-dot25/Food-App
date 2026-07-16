namespace FoodDelivery.Domain.Enums;

public enum NotificationType
{
    OrderUpdate = 1,
    Promotion = 2,
    System = 3,
    NewOrder = 4,       // For restaurant owners
    DeliveryRequest = 5 // For riders
}
