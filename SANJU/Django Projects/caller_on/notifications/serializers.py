from rest_framework import serializers
from .models import PushSubscription

class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ['id', 'endpoint', 'subscription_info']
        read_only_fields = ['id']
