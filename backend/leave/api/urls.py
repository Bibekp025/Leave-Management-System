# urls.py
from django.urls import path
from .views import LeaveListCreateView, LeaveDetailView
from .views import LeaveTypeListCreateView

urlpatterns = [
    path('leave-types/', LeaveTypeListCreateView.as_view(), name='leave-type-list-create'),
    path('leaves/', LeaveListCreateView.as_view(), name='leave-list-create'),
    path('leaves/<int:pk>/', LeaveDetailView.as_view(), name='leave-detail'),
]
