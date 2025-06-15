from rest_framework import permissions

class IsStudentOrTeacherCreateLeave(permissions.BasePermission):
    """
    Allow only students or teachers to create leave.
    """

    def has_permission(self, request, view):
        # Only allow POST for students or teachers
        if request.method == 'POST':
            return request.user.category in ['student', 'teacher']
        # Allow other methods to pass through (list, retrieve, update checked separately)
        return True


class CanUpdateLeaveStatus(permissions.BasePermission):
    """
    Permission rules:
    - Leave owners (student/teacher) can view their own leaves but cannot update.
    - Assigned teachers can view and update leaves of their students.
    - Assigned HRs can view and update leaves of their assigned teachers.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        method = request.method

        # Owners can view (GET) their own leaves but cannot update
        if user == obj.user:
            return method in permissions.SAFE_METHODS

        # Assigned teachers can view/update student leaves
        if obj.user.category == 'student' and user in obj.assigned_teachers.all():
            # Allow safe methods and update (PUT, PATCH)
            return method in permissions.SAFE_METHODS + ('PUT', 'PATCH')

        # Assigned HRs can view/update teacher leaves
        if obj.user.category == 'teacher' and user in obj.assigned_hrs.all():
            return method in permissions.SAFE_METHODS + ('PUT', 'PATCH')

        # Deny all other cases
        return False
