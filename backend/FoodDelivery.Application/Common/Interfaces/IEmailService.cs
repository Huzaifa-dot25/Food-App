namespace FoodDelivery.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string recipientName, string otpCode);
    Task SendOrderConfirmationEmailAsync(string toEmail, string recipientName, string orderNumber);
    Task SendWelcomeEmailAsync(string toEmail, string recipientName);
}
