from rest_framework.permissions import BasePermission,SAFE_METHODS

class CanCreateLeavePermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.category in ['student', 'teacher']

class CanViewLeavePermission(BasePermission):
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        # Owners can always view their leave
        if obj.user == user:
            return True

        # Teachers assigned to the student's leave
        if obj.user.category == 'student' and user.category == 'teacher':
            return user in obj.assigned_teachers.all()

        # HRs assigned to teacher's leave
        if obj.user.category == 'teacher' and user.category == 'hr':
            return user in obj.assigned_hrs.all()

        # Admins/superusers can see everything
        if user.category == 'admin' or user.is_superuser:
            return True

        return False

class CanUpdateLeavePermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in SAFE_METHODS:
            return True

        if not user.is_authenticated:
            return False

        # Teachers can update only student leaves if assigned
        if obj.user.category == 'student' and user.category == 'teacher':
            return user in obj.assigned_teachers.all()

        # HRs can update only teacher leaves if assigned
        if obj.user.category == 'teacher' and user.category == 'hr':
            return user in obj.assigned_hrs.all()

        # Admin override
        if user.category == 'admin' or user.is_superuser:
            return True

        return False
    
class CanCreateLeaveTypePermission(BasePermission):
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.category == 'hr'