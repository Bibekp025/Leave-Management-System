from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Notification
from .serializers import NotificationSerializer

# --------------------------
# List Notifications
# --------------------------
class NotificationListAPIView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_read', 'notification_type']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


# --------------------------
# Create Notification (optional)
# --------------------------
class NotificationCreateAPIView(generics.CreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # recipient should be passed in request data
        serializer.save(sender=self.request.user)


class MarkAsReadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save()
        return Response({'detail': 'Notification marked as read.'})


class MarkAllAsReadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        notifications = Notification.objects.filter(recipient=request.user, is_read=False)
        count = notifications.update(is_read=True)
        return Response({'detail': f'{count} notifications marked as read.'})
