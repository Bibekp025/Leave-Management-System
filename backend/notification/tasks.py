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


@shared_task
def notify_leave_decision(leave_id, decision_maker_id):
    User = get_user_model()
    print("Notifying leave decision for leave ID:", leave_id, "by user ID:", decision_maker_id)
    try:
        leave = Leave.objects.get(id=leave_id)
        decision_maker = User.objects.get(id=decision_maker_id)
    except (Leave.DoesNotExist, User.DoesNotExist):
        return "Leave or decision maker not found."

    status = leave.status.upper()  # e.g., "ACCEPTED" or "REJECTED"
    print("Leave user:", leave.user)
    print("Teachers:", list(leave.assigned_teachers.all()))

    # Notify the student who requested the leave
    Notification.objects.create(
        recipient=leave.user,
        sender=decision_maker,
        notification_type='leave_decision',
        title=f"Your Leave Has Been {status}",
        message=f"Your leave request from {leave.from_date} to {leave.to_date} has been {status.lower()}.",
        link=f"/leave/{leave.id}/"
    )
    for teacher in leave.assigned_teachers.exclude(id=decision_maker.id):
        Notification.objects.create(
            recipient=teacher,
            sender=decision_maker,
            notification_type='leave_decision',
            title=f"Leave {status} for {leave.user.username}",
            message=f"{leave.user.username}'s leave from {leave.from_date} to {leave.to_date} has been {status.lower()}.",
            link=f"/leave/{leave.id}/"
        )
    for hr in leave.assigned_hrs.exclude(id=decision_maker.id): 
        Notification.objects.create(
            recipient=hr,
            sender=decision_maker,
            notification_type='leave_decision',
            title=f"Leave {status} for {leave.user.username}",
            message=f"{leave.user.username}'s leave from {leave.from_date} to {leave.to_date} has been {status.lower()}.",
            link=f"/leave/{leave.id}/"
        )
    return f"Notifications sent for leave {status.lower()}."
