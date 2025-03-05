from django.urls import path
from . import views

urlpatterns = [
    path('order_manage/', views.order_manage, name='order_manage'),
    path('order_create',views.order_create,name='order_create'),
    path('api/create_or_update_order/', views.create_or_update_order, name='create_or_update_order'),
    path('api/create_order/', views.create_new_order, name='create_order'),
    path('api/order_list/', views.order_list_api, name='order_list_api'),
    path('api/order_status_update/<str:order_id>/', views.order_status_update,name='order_status_update'),
]