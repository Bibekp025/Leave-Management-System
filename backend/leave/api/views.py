from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .serializers import LeaveSerializer, LeaveTypeSerializer
from ..models import Leave, LeaveType
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


# -------------------------------
# LeaveType Views
# -------------------------------

class LeaveTypeListCreateView(generics.ListCreateAPIView):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class LeaveTypeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


# -------------------------------
# Leave Views
# -------------------------------
class LeaveListCreateView(generics.ListCreateAPIView):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'start_date', 'end_date']
    ordering_fields = ['start_date', 'end_date', 'applied_on']
    search_fields = ['reason']

    def get_queryset(self):
        user = self.request.user

        if user.category.lower() == 'admin':
            return Leave.objects.all()
        elif user.category.lower() == 'teacher':
            return Leave.objects.filter(assigned_teachers=user)
        elif user.category.lower() == 'student':
            return Leave.objects.filter(user=user)
        return Leave.objects.none()
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.category.lower() == 'admin':
            return Leave.objects.all()
        elif user.category.lower() == 'teacher':
            return Leave.objects.filter(assigned_teachers=user)
        elif user.category.lower() == 'student':
            return Leave.objects.filter(user=user)
        else:
            return Leave.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LeaveRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        leave = super().get_object()
        user = self.request.user

        # Access Control
        if user.category.lower() == 'admin':
            return leave
        elif user.category.lower() == 'teacher' and user in leave.assigned_teachers.all():
            return leave
        elif user.category.lower() == 'student' and leave.user == user:
            return leave

        raise PermissionDenied("You do not have permission to access this leave.")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        leave = self.get_object()
        serializer = self.get_serializer(leave, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        user = self.request.user
        leave = self.get_object()
        data = self.request.data

        if user.category.lower() in ['teacher', 'admin']:
            # Teachers/Admins can only change `status`
            allowed_fields = {'status'}
            extra_fields = set(data.keys()) - allowed_fields

            if extra_fields:
                raise ValidationError(f"You can only update 'status'. Invalid fields: {extra_fields}")

            if leave.status != 'pending':
                raise PermissionDenied("This leave has already been processed.")

            new_status = data.get('status')
            if new_status not in ['approved', 'rejected']:
                raise ValidationError("Status must be either 'approved' or 'rejected'.")

            serializer.save(
                status=new_status,
                approved_by=user,
                approved_on=now()
            )

        elif user.category.lower() == 'student':
            if leave.user != user:
                raise PermissionDenied("You can only update your own leave.")
            if leave.status != 'pending':
                raise PermissionDenied("You cannot edit a leave after it is processed.")
            
            serializer.save()

        else:
            raise PermissionDenied("Your role is not allowed to update this leave.")
