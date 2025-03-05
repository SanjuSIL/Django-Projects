from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .models import FoodOrder

def home(request):
    return render(request, 'index.html')


@api_view(['GET'])
@permission_classes([AllowAny])
def check_status(request):
    token_no = request.GET.get('token_no')  # You could also use request.query_params.get('token_no')
    
    try:
        order = FoodOrder.objects.get(token_no=token_no)
        data = {
            'restaurant': order.restaurant.name,
            'token_no': order.token_no,
            'status': order.get_status_display()
        }
        return Response(data, status=status.HTTP_200_OK)
    except FoodOrder.DoesNotExist:
        return Response({'error': 'Invalid token number'}, status=status.HTTP_404_NOT_FOUND)

