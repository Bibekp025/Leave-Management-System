from rest_framework import generics, permissions
from ..models import Leave, LeaveType
from .serializers import LeaveSerializer, LeaveTypeSerializer
from .permissions import IsStudentOrTeacherCreateLeave, CanUpdateLeaveStatus
from rest_framework.permissions import IsAdminUser


class LeaveTypeListCreateView(generics.ListCreateAPIView):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAdminUser]  # Only admin can create leave types


class LeaveListCreateView(generics.ListCreateAPIView):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOrTeacherCreateLeave]

    def get_queryset(self):
        user = self.request.user

        if user.category == 'student':
            # Students see only their own leaves
            return Leave.objects.filter(user=user)

        elif user.category == 'teacher':
            # Teachers see:
            # - their own leaves
            # - leaves of students assigned to them
            student_leaves = Leave.objects.filter(user__category='student', assigned_teachers=user)
            own_leaves = Leave.objects.filter(user=user)
            return (student_leaves | own_leaves).distinct()

        elif user.category == 'hr':
            # HRs see leaves of teachers assigned to them
            return Leave.objects.filter(user__category='teacher', assigned_hrs=user)

        else:
            # For any other user, no leaves visible
            return Leave.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LeaveDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated, CanUpdateLeaveStatus]

    def get_queryset(self):
        user = self.request.user

        if user.category == 'student':
            # Students can view their own leaves only
            return Leave.objects.filter(user=user)

        elif user.category == 'teacher':
            # Teachers can view:
            # - their own leaves
            # - leaves assigned to them (student leaves)
            student_leaves = Leave.objects.filter(user__category='student', assigned_teachers=user)
            own_leaves = Leave.objects.filter(user=user)
            return (student_leaves | own_leaves).distinct()

        elif user.category == 'hr':
            # HRs can view leaves of teachers assigned to them
            return Leave.objects.filter(user__category='teacher', assigned_hrs=user)

        else:
            return Leave.objects.none()
