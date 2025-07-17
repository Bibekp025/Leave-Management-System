# urls.py
from django.urls import path
from .views import (LeaveTypeListCreateAPIView, 
                    UserLeaveListCreateAPIView,
                    UserLeaveRetrieveUpdateDestroyAPIView,
                    OwnLeaveListAPIView)

urlpatterns = [
    path('leave-types/', LeaveTypeListCreateAPIView.as_view(), name='leave-type-list-create'),
    path('', UserLeaveListCreateAPIView.as_view(), name='user-leave-list-create'),
    path('<int:pk>/', UserLeaveRetrieveUpdateDestroyAPIView.as_view(), name='user-leave-detail'),
    path('own-leaves/', OwnLeaveListAPIView.as_view(), name='own-leave-list'),
]
