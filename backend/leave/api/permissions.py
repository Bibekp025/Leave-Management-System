from rest_framework.permissions import BasePermission, SAFE_METHODS

class CanCreateLeavePermission(BasePermission):
    """
    Allow only authenticated students and teachers to create leave requests.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.category in ['student', 'teacher'] and
            request.method == 'POST'
        )


class CanViewLeavePermission(BasePermission):
    """
    Object-level permission to view leave:
    - Owners can view their own leaves.
    - Assigned teachers can view student leaves assigned to them.
    - Assigned HRs can view teacher leaves assigned to them.
    - Admins and superusers can view all.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        # Owners can always view
        if obj.user == user:
            return True

        # Assigned teacher can view student leave
        if obj.user.category == 'student' and user.category == 'teacher':
            return user in obj.assigned_teachers.all()

        # Assigned HR can view teacher leave
        if obj.user.category == 'teacher' and user.category == 'hr':
            return user in obj.assigned_hrs.all()

        # Admins and superusers can view all
        if user.category == 'admin' or user.is_superuser:
            return True

        return False


class CanUpdateLeavePermission(BasePermission):
    """
    Object-level permission to update leave:
    - Assigned teachers can update student leaves assigned to them.
    - Assigned HRs can update teacher leaves assigned to them.
    - Admins and superusers can update all.
    - Safe methods (GET, HEAD, OPTIONS) are allowed if viewing permitted.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user

        # Safe methods allowed if view permission granted
        if request.method in SAFE_METHODS:
            return CanViewLeavePermission().has_object_permission(request, view, obj)

        if not user.is_authenticated:
            return False

        # Assigned teacher can update student leave
        if obj.user.category == 'student' and user.category == 'teacher':
            return user in obj.assigned_teachers.all()

        # Assigned HR can update teacher leave
        if obj.user.category == 'teacher' and user.category == 'hr':
            return user in obj.assigned_hrs.all()

        # Admin and superuser override
        if user.category == 'admin' or user.is_superuser:
            return True

        return False


class CanCreateLeaveTypePermission(BasePermission):
    """
    Allow only authenticated HR users to create leave types.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.category == 'hr'
        )
