from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    choices=[
        ('Student','STUDENT'),
        ('Faculty','FACULTY'),
        ('Admin','ADMIN')
    ]
    category=models.CharField(choices=choices, max_length=10, null=False)

    def __str__(self):
        return self.username