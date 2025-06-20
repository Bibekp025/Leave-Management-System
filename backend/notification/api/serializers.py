from rest_framework import serializers
from ..models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    recipient = serializers.StringRelatedField(read_only=True)
    sender = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'sender',
            'notification_type',
            'title',
            'message',
            'link',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'sender', 'recipient', 'created_at', 'is_read']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['sender'] = request.user
        return super().create(validated_data)
