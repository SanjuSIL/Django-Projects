from django.urls import path
from .views import home, check_status

urlpatterns = [
    path('', home, name='home'),
    path('check-status/', check_status, name='check_status'),
]
