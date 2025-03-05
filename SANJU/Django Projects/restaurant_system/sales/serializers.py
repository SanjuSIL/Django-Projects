from rest_framework import serializers
from orders.models import FoodOrder

class FoodOrderSerializer(serializers.ModelSerializer):
    # class Meta:
    #     model = FoodOrder
    #     fields = '__all__'  # Or specify the fields you want to include
    #     # fields = ['token_no', 'status', 'order_details', ...]  # Example
    
    class Meta:
        model = FoodOrder
        fields = ['token_no', 'restaurant_id', 'status']
        read_only_fields = ['restaurant_id'] # restaurant_id should be read only

    def create(self, validated_data):
        # Override the create method to set restaurant_id
        validated_data['restaurant_id'] = 1  # Hardcoded restaurant ID
        return super().create(validated_data)