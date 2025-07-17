# models.py
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class LeaveType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Leave(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaves')
    assigned_teachers = models.ManyToManyField(User, related_name='student_leaves', limit_choices_to={'category': 'teacher'}, blank=True)
    assigned_hrs = models.ManyToManyField(User, related_name='teacher_leaves', limit_choices_to={'category': 'hr'}, blank=True)

    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    from_date = models.DateField()
    to_date = models.DateField()
    days = models.IntegerField(default=0)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.leave_type} leave for {self.user.username} from {self.from_date} to {self.to_date} - {self.status}"
class LeaveBalance(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_leaves = models.IntegerField(default=30)