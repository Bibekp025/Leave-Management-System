from django.urls import path
from .views import (
    EventCategoryListCreateAPIView,
    EventListCreateAPIView,
    EventRetrieveUpdateDestroyAPIView,
  
)

urlpatterns = [
    # Event Category
    path('categories/', EventCategoryListCreateAPIView.as_view(), name='event-category-list-create'),

    # Events
    path('', EventListCreateAPIView.as_view(), name='event-list-create'),
    path('<int:pk>/', EventRetrieveUpdateDestroyAPIView.as_view(), name='event-detail'),

]
