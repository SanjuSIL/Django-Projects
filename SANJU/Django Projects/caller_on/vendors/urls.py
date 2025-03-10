from django.urls import path
from . import views

urlpatterns = [
    path('manage-order/', views.manage_order, name='manage-order'),
    path('api/update-order/', views.update_order, name='update-order'),
    path('api/get-current-time/', views.get_current_time, name='get-current-time'),
    path('api/list-order/', views.list_order, name='list-order'),
    # Add the proxy endpoint
    path('proxy/api/update-order/', views.proxy_update_order, name='proxy-update-order'),
    
]