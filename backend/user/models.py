from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    CATEGORY_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, null=False)

    def __str__(self):
        return self.username
