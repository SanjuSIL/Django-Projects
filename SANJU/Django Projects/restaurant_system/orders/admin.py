from django.contrib import admin
from .models import Restaurant, FoodOrder

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'location')  # Display fields in the admin panel
    search_fields = ('name', 'location')       # Enable search functionality

@admin.register(FoodOrder)
class FoodOrderAdmin(admin.ModelAdmin):
    list_display = ('token_no', 'restaurant', 'status', 'created_at','updated_at')
    list_filter = ('status', 'restaurant')  # Filter by status and restaurant
    search_fields = ('token_no',)

