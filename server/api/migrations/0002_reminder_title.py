# Generated by Django 5.2.1 on 2025-05-23 16:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='reminder',
            name='title',
            field=models.CharField(default='Task Reminder', help_text='The title of the reminder', max_length=100),
        ),
    ]
