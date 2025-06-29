from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from ..models import EventCategory, Event
from .serializers import (
    EventCategorySerializer,
    EventSerializer,
    
)
from notification.models import Notification

# -------------------------------
# Event Category Views
# -------------------------------
class EventCategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [permissions.IsAuthenticated]  # Replace with custom if needed


# -------------------------------
# Event Views
# -------------------------------
from rest_framework.filters import SearchFilter

class EventListCreateAPIView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['category__name', 'title', 'description']  # ✅ searchable fields

    # def get_permissions(self):
    #     if self.request.method == 'POST':
    #         return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
    def perform_create(self, serializer):
        event = serializer.save(organizer=self.request.user)

        # Optionally notify all students or a specific group
        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipients = User.objects.all()

        for recipient in recipients:
            Notification.objects.create(
                recipient=recipient,
                sender=self.request.user,
                notification_type='event',
                title=f"New Event: {event.title}",
                message=f"{event.description[:100]}...",
                link=f"/events/{event.id}/"
            )



class EventRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]  # Replace with custom permission (e.g., IsEventOwner)
