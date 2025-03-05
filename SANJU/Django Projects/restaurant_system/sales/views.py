
from django.shortcuts import render
from orders.models import FoodOrder,Restaurant
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import FoodOrderSerializer 
from rest_framework import status

def order_manage(request):
    return render(request, 'order_management.html',)

def order_create(request):
    return render(request,'order_create.html')

@api_view(['GET'])
@permission_classes([AllowAny])
def order_list_api(request):
    orders = FoodOrder.objects.all()  
    serializer = FoodOrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['PUT']) 
@permission_classes([AllowAny])
def order_status_update(request, order_id): 
    try:
        order = FoodOrder.objects.get(token_no=order_id) 
    except FoodOrder.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = FoodOrderSerializer(order, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_order_token(request, order_id):
    """
    API to update the token number for an order.
    """
    try:
        order = FoodOrder.objects.get(id=order_id)
    except FoodOrder.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = FoodOrderSerializer(order, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Token number updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_new_order(request):
    token_no = request.data.get('token_no')
    restaurant_id = 1  # Hardcoded restaurant ID

    if not token_no:
        return Response({"message": "Token number is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check if an order with the same token_no already exists
        FoodOrder.objects.get(token_no=token_no, restaurant_id=restaurant_id)
        return Response({"message": "Order with this token number already exists."}, status=status.HTTP_400_BAD_REQUEST)

    except FoodOrder.DoesNotExist:
        data = {
            'token_no': token_no,
            'restaurant_id': restaurant_id,
            'status': 'preparing'
        }
        serializer = FoodOrderSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Order created successfully."}, status=status.HTTP_201_CREATED)
        return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_or_update_order(request):
    token_no = request.data.get('token_no')
    restaurant_id = 1
    status_to_update = request.data.get('status')

    if not token_no:
        return Response({"message": "Token number is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = FoodOrder.objects.get(token_no=token_no, restaurant_id=restaurant_id)

        if status_to_update:
            if order.status == "ready" and status_to_update == "delete":
                order.delete()
                return Response({"message": f"Order {token_no} deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                order.status = status_to_update
                order.save()
                return Response({"message": f"Order status updated to {order.get_status_display()}."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": f"Order found."}, status=status.HTTP_200_OK)

    except FoodOrder.DoesNotExist:
        if status_to_update and status_to_update == "preparing":
            serializer = FoodOrderSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Order created successfully."}, status=status.HTTP_201_CREATED)
            return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def create_or_update_order(request):
#     token_no = request.data.get('token_no')
#     restaurant_id = 1
#     status_to_update = request.data.get('status') # get the status from request.

#     if not token_no or not restaurant_id:
#         return Response({"error": "Token number and restaurant ID are required."}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         order = FoodOrder.objects.get(token_no=token_no, restaurant_id=restaurant_id)
#         print(order.status)
#         if status_to_update:
#             order.status = status_to_update
#             order.save()
#             return Response({"message": f"Order status updated to {order.get_status_display()}."}, status=status.HTTP_200_OK)
#         else:
#             return Response({"message": f"Order found."}, status=status.HTTP_200_OK)

#     except FoodOrder.DoesNotExist:
#         if status_to_update and status_to_update == "pending":
#             serializer = FoodOrderSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({"message": "Order created successfully."}, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def create_or_update_order(request):
#     """
#     API to create a new order if the token number does not exist,
#     or update the existing order's status and updated_at field.
#     """
#     token_no = request.data.get('token_no')
#     restaurant_id = request.data.get('restaurant_id')
#     status_value = request.data.get('status', 'pending')

#     if not token_no or not restaurant_id:
#         return Response({'error': 'Token number and restaurant ID are required'}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         restaurant = Restaurant.objects.get(id=restaurant_id)
#     except Restaurant.DoesNotExist:
#         return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)

#     order, created = FoodOrder.objects.update_or_create(
#         token_no=token_no,
#         restaurant=restaurant,
#         defaults={'status': status_value}
#     )

#     serializer = FoodOrderSerializer(order)
    
#     if created:
#         return Response({'message': 'Order created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
#     else:
#         return Response({'message': 'Order updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)