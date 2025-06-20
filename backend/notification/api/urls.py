from django.urls import path
from .views import (
    NotificationListAPIView,
    NotificationCreateAPIView,
    MarkAsReadAPIView,
    MarkAllAsReadAPIView
)

urlpatterns = [
    path('', NotificationListAPIView.as_view(), name='notification-list'),
    path('create/', NotificationCreateAPIView.as_view(), name='notification-create'),
    path('<int:pk>/read/', MarkAsReadAPIView.as_view(), name='notification-mark-read'),
    path('read-all/', MarkAllAsReadAPIView.as_view(), name='notification-mark-all-read'),
]
