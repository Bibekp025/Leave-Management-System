from django.contrib import admin

# Register your models here.
from .models import LeaveType,Leave

admin.site.register(Leave)
admin.site.register(LeaveType)