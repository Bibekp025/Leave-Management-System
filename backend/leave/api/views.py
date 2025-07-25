from rest_framework import permissions
from .serializers import LeaveSerializer, LeaveTypeSerializer,LeaveSummarySerializer
from ..models import Leave, LeaveType, LeaveBalance
from .utils import get_available_leaves
from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from .permissions import (
    CanCreateLeavePermission,
    CanViewLeavePermission,
    CanUpdateLeavePermission,
    CanCreateLeaveTypePermission,
)
from notification.models import Notification
from notification.tasks import notify_teachers_about_leave, notify_leave_decision
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
    def create(self, request, *args, **kwargs):
        user = request.user
        available = get_available_leaves(user)

        if available <= 0:
            return Response({"error": "You don't have any available leave."}, status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)
        
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
        leave_obj = self.get_object()
        old_status = leave_obj.status

        leave = serializer.save()
        new_status = leave.status
        print("Old status:", old_status, "New status:", new_status)
        # Notify teachers and HRs about the update
        notify_teachers_about_leave.delay(leave.id, self.request.user.id)
        # If status changed to approved/rejected, notify user and teachers
        if old_status != new_status and new_status in ['approved', 'rejected']:
            notify_leave_decision.delay(leave.id, self.request.user.id)
        else:
            # Optional: if it's just an update (reason, dates), notify teachers again
            notify_teachers_about_leave.delay(leave.id, self.request.user.id)
      
        # Notification.objects.create(
        #     recipient=leave.user,
        #     sender=self.request.user,
        #     notification_type='leave',§§
        #     title="Your Leave Request was Updated",
        #     message=f"{self.request.user.username} has updated your leave request.",
        #     link=f"/leaves/{leave.id}/"


class LeaveSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = LeaveSummarySerializer({}, context={'request': request})
        return Response(serializer.data)