from django.urls import path
from .views import (
    LeaveTypeListCreateView,
    LeaveTypeRetrieveUpdateDestroyView,
    LeaveListCreateView,
    LeaveRetrieveUpdateDestroyView,
)

urlpatterns = [
    path('leave-types/', LeaveTypeListCreateView.as_view(), name='leave-type-list-create'),
    path('leave-types/<int:pk>/', LeaveTypeRetrieveUpdateDestroyView.as_view(), name='leave-type-detail'),
    path('leaves/', LeaveListCreateView.as_view(), name='leave-list-create'),
    path('leaves/<int:pk>/', LeaveRetrieveUpdateDestroyView.as_view(), name='leave-detail'),
]
