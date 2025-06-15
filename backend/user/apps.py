from django.apps import AppConfig

class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'  # Replace with your actual app name

    def ready(self):
        import user.api.signals  # Adjust based on actual path
