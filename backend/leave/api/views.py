from rest_framework import generics, permissions
from .serializers import LeaveSerializer, LeaveTypeSerializer
from ..models import Leave, LeaveType
from .permissions import IsStudent, IsTeacher, IsAdmin
from django.utils.timezone import now

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
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsStudent() or IsTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LeaveRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [IsTeacher() or IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        if self.request.user.category in ['teacher', 'admin']:
            serializer.save(
                approved_by=self.request.user,
                approved_on=now()
            )
        else:
            serializer.save()  # If students are allowed to edit before approval
