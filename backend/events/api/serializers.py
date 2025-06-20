from rest_framework import serializers
from ..models import EventCategory

from django.contrib.auth import get_user_model
from ..models import Event


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'description']


User = get_user_model()

class EventSerializer(serializers.ModelSerializer):
    organizer = serializers.StringRelatedField(read_only=True)
    category = EventCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=EventCategory.objects.all(), source='category', write_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'category_id',
            'organizer', 'start_time', 'end_time',
            'location', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'organizer', 'status', 'created_at']

    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)
