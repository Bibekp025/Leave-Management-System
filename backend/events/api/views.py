from rest_framework import generics
from ..models import Event
from .serializers import EventSerializer

# List all events or create a new one
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

# Retrieve, update, or delete a specific event
class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
