"""
URL configuration for the API app.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('filters/', views.get_filter_options, name='filter_options'),
    path('data/', views.get_filtered_data, name='filtered_data'),
]

