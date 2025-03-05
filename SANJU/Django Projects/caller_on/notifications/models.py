from django.db import models

class PushSubscription(models.Model):
    endpoint = models.URLField(unique=True)
    subscription_info = models.JSONField()

    def __str__(self):
        return self.endpoint
