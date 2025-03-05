# notifications/api.py
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import PushSubscription
from .serializers import PushSubscriptionSerializer

def home(request):
    return render(request,'index.html')

@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe(request):
    """
    Save or update a push subscription.
    The client should send the full subscription JSON.
    """
    serializer = PushSubscriptionSerializer(data=request.data)
    if serializer.is_valid():
        endpoint = serializer.validated_data.get("endpoint")
        subscription_info = serializer.validated_data.get("subscription_info", request.data)
        obj, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={"subscription_info": subscription_info}
        )
        return Response(PushSubscriptionSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# notifications/api.py (continued)

import json
from django.conf import settings
from pywebpush import webpush, WebPushException

@api_view(['POST'])
@permission_classes([AllowAny])
def send_push(request):
    """
    Send a push notification to all subscribed clients.
    The request should include 'title' and 'body' for the notification.
    """
    title = request.data.get("title", "Notification")
    body = request.data.get("body", "You have a new alert!")
    
    payload = json.dumps({
        "title": title,
        "body": body
    })
    
    subscriptions = PushSubscription.objects.all()
    results = []
    for sub in subscriptions:
        try:
            webpush(
                subscription_info=sub.subscription_info,
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims=settings.VAPID_CLAIMS,
            )
            results.append({"endpoint": sub.endpoint, "status": "sent"})
        except WebPushException as ex:
            results.append({"endpoint": sub.endpoint, "status": "failed", "error": str(ex)})
    
    return Response({"results": results}, status=status.HTTP_200_OK)
