from django.db import models

class Event(models.Model):
    EVENT_CATEGORIES = [
        ('CONF', 'Conference'),
        ('WORK', 'Workshop'),
        ('MEET', 'Meetup'),
        ('WEBI', 'Webinar'),
        ('OTHR', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=5, choices=EVENT_CATEGORIES, default='OTHR')
    location = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    organizer = models.CharField(max_length=255)
    image = models.ImageField(upload_to='event_images/', null=True, blank=True)  # 👈 Added image field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['start_time']
