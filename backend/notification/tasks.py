from celery import shared_task
from .models import Notification
from django.contrib.auth import get_user_model
from leave.models import Leave  # or wherever your Leave model is

@shared_task
def notify_teachers_about_leave(leave_id, sender_id):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    leave = Leave.objects.get(id=leave_id)
    sender = User.objects.get(id=sender_id)

    for teacher in leave.assigned_teachers.all():
        Notification.objects.create(
            recipient=teacher,
            sender=sender,
            notification_type='leave',
            title=f"New Leave Request from {sender.username}",
            message=f"{sender.username} has requested leave from {leave.from_date} to {leave.to_date}.",
            link=f"/leaves/{leave.id}/"
        )

    for hr in leave.assigned_hrs.all(): # Notify HRs as well
        Notification.objects.create(
            recipient=hr,
            sender=sender,
            notification_type='leave',
            title=f"New Leave Request from {sender.username}",
            message=f"{sender.username} has requested leave from {leave.from_date} to {leave.to_date}.",
            link=f"/leaves/{leave.id}/"
        )
