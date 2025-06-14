from rest_framework import generics, permissions
from .serializers import LeaveSerializer, LeaveTypeSerializer
from ..models import Leave, LeaveType
from django.utils.timezone import now
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

# LeaveType Views
class LeaveTypeListCreateView(generics.ListCreateAPIView):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class LeaveTypeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


# Leave Views
class LeaveListCreateView(generics.ListCreateAPIView):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.category == 'admin':
            # Admin sees all leaves
            return Leave.objects.all()

        if user.category == 'teacher':
            # Teacher sees leaves where assigned_teachers include them
            # return Leave.objects.filter(assigned_teachers=user)
            return Leave.objects.all()

        if user.category == 'student':
            # Student sees only their own leaves
            return Leave.objects.filter(user=user)

        # Default fallback: no leaves
        return Leave.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

class LeaveRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        leave = super().get_object()
        user = self.request.user

        if user.category.lower() in ['teacher', 'admin']:
            return leave

        if user.category.lower() == 'student' and leave.user == user:
            return leave

        raise PermissionDenied("You do not have permission to access this leave.")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        # ✅ Send back JSON response
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        user = self.request.user
        leave = self.get_object()
        data = self.request.data

        if user.category.lower() in ['teacher', 'admin']:
            allowed_fields = {'status'}
            extra_fields = set(data.keys()) - allowed_fields

            if extra_fields:
                raise ValidationError(f"Only 'status' can be updated by teachers/admins, but got: {extra_fields}")

            new_status = data.get("status")
            if leave.status != 'pending':
                raise PermissionDenied("Leave is already processed.")

            if new_status not in ['approved', 'rejected']:
                raise ValidationError("Status must be 'approved' or 'rejected'.")

            serializer.save(
                status=new_status,
                approved_by=user,
                approved_on=now()
            )

        elif user.category.lower() == 'student':
            if leave.user != user:
                raise PermissionDenied("You can only update your own leaves.")

            if leave.status != 'pending':
                raise PermissionDenied("You cannot modify leave after it has been processed.")

            serializer.save()
