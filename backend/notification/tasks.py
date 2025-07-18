from celery import shared_task
from django.contrib.auth import get_user_model
from leave.models import Leave
from .models import Notification

@shared_task
def notify_teachers_about_leave(leave_id, sender_id):
    User = get_user_model()

    try:
        leave = Leave.objects.get(id=leave_id)
        sender = User.objects.get(id=sender_id)
    except (Leave.DoesNotExist, User.DoesNotExist):
        return "Leave or sender not found."

    # Notify assigned teachers except the sender
    for teacher in leave.assigned_teachers.exclude(id=sender.id):
        Notification.objects.create(
            recipient=teacher,
            sender=sender,
            notification_type='leave',
            title=f"New Leave Request from {sender.username}",
            message=f"{sender.username} has requested leave from {leave.from_date} to {leave.to_date}.",
            link=f"/leave/{leave.id}/"
        )

    # Notify HRs (regardless of sender)
    for hr in leave.assigned_hrs.exclude(id=sender.id):  # Optional: exclude if HRs also submit leave
        Notification.objects.create(
            recipient=hr,
            sender=sender,
            notification_type='leave',
            title=f"New Leave Request from {sender.username}",
            message=f"{sender.username} has requested leave from {leave.from_date} to {leave.to_date}.",
            link=f"/leave/{leave.id}/"
        )

    return "Notifications sent."
