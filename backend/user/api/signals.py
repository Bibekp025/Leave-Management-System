# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.core.mail import send_mail
# from django.conf import settings
# from django.contrib.auth import get_user_model

# User = get_user_model()

# @receiver(post_save, sender=User)
# def user_created_signal(sender, instance, created, **kwargs):
#     if created:
#         print(f"🟢 New user created: {instance.username}")

#         # Example: Send welcome email
#         send_mail(
#             subject='Welcome to the System!',
#             message=f'Hi {instance.username}, your account has been successfully created.',
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[instance.email],
#             fail_silently=True,
#         )
