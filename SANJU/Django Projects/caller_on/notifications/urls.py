from django.urls import path
from .import views

urlpatterns = [
    path('subscribe/', views.subscribe, name='subscribe'),
    path('send/', views.send_push, name='send_push'),
    path('',views.home,name='home')
    
]
