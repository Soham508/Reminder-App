# Generated by Django 5.2.1 on 2025-05-23 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_reminder_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='reminder',
            name='email',
            field=models.EmailField(blank=True, help_text='Recipient email address', max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='reminder',
            name='phone_number',
            field=models.CharField(blank=True, help_text='Recipient phone number', max_length=15, null=True),
        ),
    ]
