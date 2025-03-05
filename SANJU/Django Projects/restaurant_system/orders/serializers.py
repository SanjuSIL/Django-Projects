from rest_framework import serializers
from .models import FoodOrder

class FoodOrderSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    
    class Meta:
        model = FoodOrder
        fields = ['id', 'created_at', 'updated_at','restaurant_name', 'token_no', 'status']
