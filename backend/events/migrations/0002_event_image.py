# Generated by Django 5.2.2 on 2025-06-22 07:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="event_images/"),
        ),
    ]
