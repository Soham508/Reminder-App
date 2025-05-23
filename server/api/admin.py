from django.contrib import admin
from .models import Reminder

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('message', 'date', 'time', 'reminder_method', 'created_at')
    search_fields = ('message', 'reminder_method')
    list_filter = ('reminder_method', 'created_at')