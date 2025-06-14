from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from ..models import Leave
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

# Step 1: Store the old status before saving
@receiver(pre_save, sender=Leave)
def store_previous_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Leave.objects.get(pk=instance.pk)
            instance._previous_status = old_instance.status
        except Leave.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None

# Step 2: Handle notifications after saving
@receiver(post_save, sender=Leave)
def notify_users_on_leave(sender, instance, created, **kwargs):
    # New leave request submitted — notify teachers
    if created:
        teachers = User.objects.filter(category='teacher')
        emails = [teacher.email for teacher in teachers if teacher.email]

        if emails:
            send_mail(
                subject='New Leave Request Submitted',
                message=(
                    f"Dear Teacher,\n\n"
                    f"{instance.user.get_full_name() or instance.user.username} has submitted a leave request.\n\n"
                    f"📅 Start Date: {instance.start_date}\n"
                    f"📅 End Date: {instance.end_date}\n"
                    f"📝 Reason: {instance.reason}\n\n"
                    f"Please log in to the portal to review and take action.\n\n"
                    f"Regards,\n"
                    f"Leave Management System"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=emails,
                fail_silently=False,
            )

    # Existing leave updated — check if status changed to approved or rejected
    else:
        old_status = getattr(instance, '_previous_status', None)
        new_status = instance.status

        if old_status != new_status and new_status in ['approved', 'rejected']:
            send_mail(
                subject=f'Your Leave Request has been {new_status.capitalize()}',
                message=(
                    f"Dear {instance.user.get_full_name() or instance.user.username},\n\n"
                    f"Your leave request from {instance.start_date} to {instance.end_date} has been {new_status}.\n\n"
                    f"📝 Reason: {instance.reason}\n\n"
                    f"Regards,\n"
                    f"Leave Management System"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.user.email],
                fail_silently=False,
            )
