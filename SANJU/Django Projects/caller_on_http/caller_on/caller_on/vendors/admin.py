from django.contrib import admin
from .models import Vendor, Order, Device

@admin.register(Vendor)
class VendorsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'location','vendor_id','created_at','updated_at')  # Display fields in the admin panel
    search_fields = ('name', 'location')       # Enable search functionality

@admin.register(Order)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ('token_no', 'vendor', 'counter_no', 'status','updated_by','created_at','updated_at')
    list_filter = ('status', 'vendor')  # Filter by status and restaurant
    search_fields = ('token_no',)

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('serial_no', 'vendor','created_at','updated_at')
    list_filter = ('serial_no', 'vendor')  # Filter by status and restaurant
    search_fields = ('serial_no',)
