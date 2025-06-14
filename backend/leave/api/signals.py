from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from ..models import Leave  # Adjust import if needed


@receiver(post_save, sender=Leave)
def leave_created_or_updated(sender, instance, created, **kwargs):
    # Send email when leave is created to assigned teacher(s)
    if created:
        teachers = instance.assigned_teachers.all()  # Assuming ManyToMany or ForeignKey
        teacher_emails = [teacher.email for teacher in teachers if teacher.email]

        if teacher_emails:
            send_mail(
                subject=f"New Leave Request from {instance.student.get_full_name()}",
                message=(
                    f"Dear Teacher,\n\n"
                    f"A new leave request has been submitted by {instance.student.get_full_name()}.\n"
                    f"Leave Type: {instance.leave_type}\n"
                    f"From: {instance.start_date}\n"
                    f"To: {instance.end_date}\n"
                    f"Reason: {instance.reason}\n\n"
                    "Please review the request in the system."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=teacher_emails,
                fail_silently=False,
            )
    else:
        # Leave updated - check if status changed to accepted or rejected
        if instance.status in ['accepted', 'rejected']:
            # Notify the student about the status update
            student_email = instance.student.email
            if student_email:
                send_mail(
                    subject=f"Your leave request has been {instance.status}",
                    message=(
                        f"Dear {instance.student.get_full_name()},\n\n"
                        f"Your leave request from {instance.start_date} to {instance.end_date} "
                        f"has been {instance.status}.\n\n"
                        f"Comments: {instance.admin_comments or 'No comments'}\n\n"
                        "Thank you."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[student_email],
                    fail_silently=False,
                )
