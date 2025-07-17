from rest_framework import permissions
from .serializers import LeaveSerializer, LeaveTypeSerializer
from ..models import Leave, LeaveType, LeaveBalance
from rest_framework import generics
from rest_framework.views import APIView
from django.db.models import Sum

from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .permissions import (
    CanCreateLeavePermission,
    CanViewLeavePermission,
    CanUpdateLeavePermission,
    CanCreateLeaveTypePermission,
)
from notification.models import Notification
from notification.tasks import notify_teachers_about_leave
User = get_user_model()


class LeaveTypeListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = LeaveTypeSerializer
    queryset = LeaveType.objects.all()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [CanCreateLeaveTypePermission()]
        return [permissions.IsAuthenticated()]

class OwnLeaveListAPIView(generics.ListAPIView):
    serializer_class = LeaveSerializer
    permission_classes = [CanViewLeavePermission]

    def get_queryset(self):
        user = self.request.user
        return Leave.objects.all().filter(user=user)

class UserLeaveListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = LeaveSerializer
    queryset = Leave.objects.all()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [CanCreateLeavePermission()]
        return [permissions.IsAuthenticated()]  # Use IsAuthenticated for list view

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Leave.objects.none()

        if user.category == 'student':
            return Leave.objects.filter(user=user)

        elif user.category == 'teacher':
            return Leave.objects.filter(assigned_teachers=user)

        elif user.category == 'hr':
            return Leave.objects.filter(assigned_hrs=user)

        elif user.category == 'admin' or user.is_superuser:
            return Leave.objects.all()

        return Leave.objects.none()

    def perform_create(self, serializer):
        leave = serializer.save(user=self.request.user)
        notify_teachers_about_leave.delay(leave.id, self.request.user.id)
        
        # Notify assigned teachers
        # for teacher in leave.assigned_teachers.all():
        #     Notification.objects.create(
        #         recipient=teacher,
        #         sender=self.request.user,
        #         notification_type='leave',
        #         title=f"New Leave Request from {self.request.user.username}",
        #         message=f"{self.request.user.username} has requested leave from {leave.from_date} to {leave.to_date}.",
        #         link=f"/leaves/{leave.id}/"
        #     )
        # for hr in leave.assigned_hrs.all():
        #     Notification.objects.create(
        #         recipient=hr,
        #         sender=self.request.user,
        #         notification_type='leave',
        #         title=f"New Leave Request from {self.request.user.username}",
        #         message=f"{self.request.user.username} has requested leave from {leave.from_date} to {leave.to_date}.",
        #         link=f"/leaves/{leave.id}/"
        #     )


class UserLeaveRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LeaveSerializer
    permission_classes = [CanUpdateLeavePermission]
    queryset = Leave.objects.all()

    def perform_update(self, serializer):
        leave = serializer.save()
        notify_teachers_about_leave.delay(leave.id, self.request.user.id)
        
      
        # Notification.objects.create(
        #     recipient=leave.user,
        #     sender=self.request.user,
        #     notification_type='leave',
        #     title="Your Leave Request was Updated",
        #     message=f"{self.request.user.username} has updated your leave request.",
        #     link=f"/leaves/{leave.id}/"
class LeaveSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        TOTAL_DAYS = 48

        # Total applied leave applications (excluding rejected)
        applied_count = Leave.objects.filter(user=user).exclude(status='rejected').count()

        # Total approved leave applications
        approved_count = Leave.objects.filter(user=user, status='approved').count()
        total_available = int(TOTAL_DAYS * 0.2) - approved_count  # 80% of total days
    

        return Response({
            'total_available_leave': total_available,
            'total_applied_leave': applied_count,
            'total_approved_leave': approved_count,
        })
