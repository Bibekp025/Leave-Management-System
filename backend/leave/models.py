from django.db import models
from user.models import User
from django.conf import settings

# Create your models here.

class LeaveType(models.Model):
    CHOICES=[
        ('sick','Sick'),
        ('event','Event')
    ]
    type=models.CharField(choices=CHOICES)
    name=models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Leave(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_teachers = models.ManyToManyField(
        User,
        limit_choices_to={'category': 'Teacher'},
        related_name='assigned_leaves',
        blank=True
    )
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(choices=STATUS_CHOICES, max_length=10, default='pending')
    applied_on = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, null=True, blank=True, related_name='approved_leaves', on_delete=models.SET_NULL)
    approved_on = models.DateTimeField(null=True, blank=True)

    def number_of_days(self):
        return (self.end_date - self.start_date).days + 1

    def __str__(self):
        return f"{self.user.username} - {self.status}"

