# In orders/utils/push.py
from pywebpush import webpush, WebPushException
from django.conf import settings

def send_push_notification(subscription_info, payload):
    try:
        # webpush(
        #     subscription_info=subscription_info,
        #     data=payload,
        #     vapid_private_key=settings.VAPID_PRIVATE_KEY,
        #     vapid_claims={
        #         "sub": "mailto:sanju.softland@gmail.com"
        #     }
        # )
        webpush(
            subscription_info=subscription_info,
            data="Hello from server!",
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": "mailto:sanju.softland@gmail.com"}
        )

        print("success")
        return True
    except WebPushException as ex:
        print("Web push failed: {}", repr(ex))
        return False
