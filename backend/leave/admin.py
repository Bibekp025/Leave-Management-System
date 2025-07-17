from django.contrib import admin

# Register your models here.
from .models import LeaveType,Leave,LeaveBalance

admin.site.register(Leave)
admin.site.register(LeaveType)
admin.site.register(LeaveBalance)