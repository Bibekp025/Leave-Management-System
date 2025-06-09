from django.urls import path
from .views import EventListCreateView, EventRetrieveUpdateDestroyView


urlpatterns = [
    path('events/', EventListCreateView.as_view()),
    path('events/<int:pk>/', EventRetrieveUpdateDestroyView.as_view(), name='event-detail'),
]
