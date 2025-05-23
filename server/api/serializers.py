from rest_framework import serializers
from .models import Reminder, User
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'age', 'bio']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            age=validated_data.get('age'),
            bio=validated_data.get('bio')
        )
        return user



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'age', 'bio']



class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = [
            'id', 'user', 'title', 'date', 'time',
            'message', 'reminder_method', 'email',
            'phone_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'user']

    def validate(self, data):
        reminder_method = data.get("reminder_method")
        email = data.get("email")
        phone_number = data.get("phone_number")

        if reminder_method == "Email" and not email:
            raise serializers.ValidationError({"email": "Email is required when Email reminder method is selected."})

        if reminder_method == "SMS" and not phone_number:
            raise serializers.ValidationError({"phone_number": "Phone number is required when SMS reminder method is selected."})

        return data

    def create(self, validated_data):
        # Set user from context
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)