namespace FoodDelivery.Application.DTOs.Payment;

public class PaymentDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? TransactionReference { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Request sent from mobile when customer taps "Pay with Card".</summary>
public class ProcessPaymentRequest
{
    public int OrderId { get; set; }
    /// <summary>Mock card token (e.g. "tok_visa") — no real card data.</summary>
    public string CardToken { get; set; } = string.Empty;
}

/// <summary>Result returned by the mock payment gateway adapter.</summary>
public class PaymentResultDto
{
    public bool IsSuccess { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}
