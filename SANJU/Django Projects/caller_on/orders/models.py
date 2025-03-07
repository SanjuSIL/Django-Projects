from django.db import models

class PushSubscription(models.Model):
    USER_CHOICES = [
        ('client', 'Client'),
        ('customer', 'Customer'),
    ]

    device = models.ForeignKey('vendors.Device', on_delete=models.CASCADE, related_name="push_subscriptions")
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    user_type = models.CharField(max_length=20, choices=USER_CHOICES, default='customer')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.device.serial_no} - {self.user_type}"
