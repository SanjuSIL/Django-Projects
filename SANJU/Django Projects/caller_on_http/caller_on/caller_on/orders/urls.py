from django.urls import path
from .import views

urlpatterns = [
    path('', views.home, name='home'),
    
    # Fetch order status (GET request)
    path('check-status/', views.check_status, name='check_status'),
    
    # Fetch order status (GET request)
    # path('get-token-status/', views.get_token_status, name='get_token_status'),
    
    # Create a new order if it doesn't exist (POST request)
    # path('create-order/', views.create_order, name='create_order'),
    
]
