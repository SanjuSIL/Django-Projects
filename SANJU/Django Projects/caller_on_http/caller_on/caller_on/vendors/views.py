from django.shortcuts import render
from .models import Order,Vendor,Device
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import OrdersSerializer 
from rest_framework import status
from django.core.cache import cache
from django.utils import timezone
import pytz

def get_current_ist_time():
    ist = pytz.timezone('Asia/Kolkata')
    return timezone.now().astimezone(ist)  # Convert UTC to IST

@api_view(['GET'])
@permission_classes([AllowAny])
def get_current_time(request):
    current_time = get_current_ist_time()
    return Response({'current_time': current_time.strftime('%Y-%m-%d %H:%M:%S')})



def manage_order(request):
    cache.clear()
    return render(request, 'order_management.html')


@api_view(['GET'])
@permission_classes([AllowAny])
def list_order(request):
    orders = Order.objects.all()  
    serializer = OrdersSerializer(orders, many=True)
    return Response(serializer.data)
   
@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_order(request):
    """
    This endpoint is used for updating an existing order's token status to "ready".
    If the order (token) does not exist, it creates a new order with status "ready".
    Additionally, if the current status is "ready" and the request specifies "delete",
    the order is deleted.
    """
    try:
        data = request.data
        vendor_id = data.get('vendor_id')
        device_id = data.get('device_id')
        counter_no = data.get('counter_no')
        token_no = data.get('token_no')
        status_to_update = data.get('status')

        if not token_no or not status_to_update or not vendor_id or not device_id or not counter_no:
            return Response(
                {"message": "Token number and status are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        vendors = Vendor.objects.get(vendor_id=vendor_id)  # Fetch the vendor instance
        devices = Device.objects.get(serial_no=device_id)
        try:
            # Try to fetch the existing order
            order = Order.objects.get(token_no=token_no, vendor=vendors.id)
            # Otherwise, update the order's status to the provided status (typically "ready")
            order.status = status_to_update
            order.counter_no = counter_no
            order.save()
            return Response(
                {"message": "Order status updated.", "token_no": token_no, "status": order.status},
                status=status.HTTP_200_OK
            )

        except Order.DoesNotExist:
            # Order doesn't exist; create a new order with the status "ready"
            # Here, we assume that if an order is created via update_order, its status must be "ready"
            # If the client passes a different status, you can decide how to handle it.
            new_order_data = {
                'token_no': token_no,
                'vendor': vendors.id,
                'device_id':devices.id,
                'counter_no':counter_no,
                'status': "ready"
            }
            serializer = OrdersSerializer(data=new_order_data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "Order status updated.", "token_no": token_no, "status": "ready"},
                    status=status.HTTP_201_CREATED
                )
            return Response(
                {"message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


