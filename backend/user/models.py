from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    CATEGORY_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('hr', 'HR'),
    ]
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.get_category_display()})"

    # Role-based helper methods
    def is_student(self):
        return self.category == 'student'

    def is_teacher(self):
        return self.category == 'teacher'

    def is_hr(self):
        return self.category == 'hr'
