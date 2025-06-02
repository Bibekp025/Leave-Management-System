from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Leave
from django.core.mail import send_mail
from django.conf import settings

@receiver(post_save, sender=Leave)
def notify_assigned_teachers(sender, instance, created, **kwargs):
    if created:
        teachers = instance.assigned_teachers.all()
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
