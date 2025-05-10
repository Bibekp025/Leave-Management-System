from django.db import models
from user.models import User

# Create your models here.

class LeaveType(models.Model):
    CHOICES=[
        ('sick','Sick'),
        ('event','Event')
    ]
    type=models.CharField(choices=CHOICES)
    name=models.CharField(max_length=100)
class Leave(models.Model):
    CHOICES=[
        ('pending','Pending'),
        ('approved','Approved'),
        ('rejected','Rejected')
    ]
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    leave_type=models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date=models.DateField(auto_now_add=True)
    end_date=models.DateField(auto_now_add=True)
    reason=models.TextField()
    status=models.CharField(choices=CHOICES, max_length=10)
    applied_on=models.DateTimeField(auto_created=True)
    approved_by=models.ForeignKey(User, null=True, blank=True)
    approved_on=models.DateTimeField(null=True, blank=True)
    
    def number_of_days(self):
        return(self.end_date-self.start_date).days +1
