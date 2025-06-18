from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from ..models import Leave

@receiver(post_save, sender=Leave)
def notify_assigned_users(sender, instance, created, **kwargs):
    user = instance.user
    leave_type = "created" if created else "updated"
    
    # Subject and message setup
    subject = f"Leave {leave_type.title()} by {user.username}"
    message = f"""
    Hello,

    A leave has been {leave_type} by {user.username} ({user.category}).

    Leave Details:
    From: {instance.from_date}
    To: {instance.to_date}
    Reason: {instance.reason}
    Status: {instance.status}

    Please take necessary action.

    Thanks,
    Leave Management System
    """
    
    # Determine recipients
    if user.category == 'student':
        recipients = [t.email for t in instance.assigned_teachers.all()]
    elif user.category == 'teacher':
        recipients = [h.email for h in instance.assigned_hrs.all()]
    else:
        recipients = []

    if recipients:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipients)
        print(f"📧 Email sent to: {recipients}")
    else:
        print("❌ No assigned users to notify.")
