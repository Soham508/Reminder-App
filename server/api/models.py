from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField()
    age = models.IntegerField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.username
    

class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    title = models.CharField(max_length=100, default="Task Reminder", help_text="The title of the reminder")
    message = models.TextField()
    reminder_method = models.CharField(
        max_length=10,
        choices=[("SMS", "SMS"), ("Email", "Email")],
        default="Email",
        help_text="The method to deliver the reminder"
    )
    email = models.EmailField(null=True, blank=True, help_text="Recipient email address")
    phone_number = models.CharField(max_length=15, null=True, blank=True, help_text="Recipient phone number")
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the reminder was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the reminder was last updated")

    def __str__(self):
        return f"Reminder: {self.message} at {self.date} {self.time}"