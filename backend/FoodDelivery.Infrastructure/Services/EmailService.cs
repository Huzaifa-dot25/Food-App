using FoodDelivery.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace FoodDelivery.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(string toEmail, string recipientName, string otpCode)
    {
        var subject = "Your Food Delivery Verification Code";
        var body = $@"
            <h2>Hi {recipientName},</h2>
            <p>Your verification code is:</p>
            <h1 style='font-size:48px;letter-spacing:8px;color:#FF6B35;'>{otpCode}</h1>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>";

        await SendAsync(toEmail, subject, body);
    }

    public async Task SendOrderConfirmationEmailAsync(string toEmail, string recipientName, string orderNumber)
    {
        var subject = $"Order Confirmed — {orderNumber}";
        var body = $@"
            <h2>Hi {recipientName},</h2>
            <p>Your order <strong>{orderNumber}</strong> has been confirmed!</p>
            <p>We'll notify you as soon as it's on its way.</p>";

        await SendAsync(toEmail, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string recipientName)
    {
        var subject = "Welcome to Food Delivery App!";
        var body = $@"
            <h2>Welcome, {recipientName}!</h2>
            <p>Your account has been created successfully.</p>
            <p>Discover hundreds of restaurants near you and order in minutes.</p>";

        await SendAsync(toEmail, subject, body);
    }

    private async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["EmailSettings:SenderName"],
                _config["EmailSettings:SenderEmail"]));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["EmailSettings:SmtpHost"],
                int.Parse(_config["EmailSettings:SmtpPort"] ?? "587"),
                SecureSocketOptions.StartTls);

            await client.AuthenticateAsync(
                _config["EmailSettings:Username"],
                _config["EmailSettings:Password"]);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            // Log but don't throw — email failure should not break the flow
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }
}
