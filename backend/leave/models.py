from django.db import models
from django.core.exceptions import ValidationError
from user.models import User


class LeaveType(models.Model):
    LEAVE_CHOICES = [
        ('sick', 'Sick'),
        ('event', 'Event'),
        ('casual', 'Casual'),
        ('maternity', 'Maternity'),
        ('other', 'Other'),
    ]
    type = models.CharField(max_length=20, choices=LEAVE_CHOICES)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Leave(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaves')
    
    assigned_teachers = models.ManyToManyField(
        User,
        limit_choices_to={'category': 'teacher'},
        related_name='assigned_leaves',
        blank=True
    )
    
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name='leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    leave_attachment = models.FileField(upload_to='leave_attachments/', null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    applied_on = models.DateTimeField(auto_now_add=True)
    
    approved_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name='approved_leaves',
        on_delete=models.SET_NULL
    )
    approved_on = models.DateTimeField(null=True, blank=True)
    
    updated_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name='updated_leaves',
        on_delete=models.SET_NULL
    )
    updated_on = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date.")

    @property
    def number_of_days(self):
        return (self.end_date - self.start_date).days + 1

    def __str__(self):
        return f"{self.user.username} - {self.leave_type.name} ({self.status})"
