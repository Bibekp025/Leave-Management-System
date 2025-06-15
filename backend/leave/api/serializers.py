# serializers.py
from rest_framework import serializers
from ..models import Leave, LeaveType
from django.contrib.auth import get_user_model

User = get_user_model()

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name']


class LeaveSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    leave_type = serializers.PrimaryKeyRelatedField(queryset=LeaveType.objects.all())
    assigned_teachers = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.filter(category='teacher'), required=False
    )
    assigned_hrs = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.filter(category='hr'), required=False
    )

    class Meta:
        model = Leave
        fields = [
            'id', 'user', 'leave_type', 'from_date', 'to_date', 'reason',
            'status', 'assigned_teachers', 'assigned_hrs', 'created_at', 'updated_at'
        ]
        read_only_fields = [ 'created_at']

    def create(self, validated_data):
        assigned_teachers = validated_data.pop('assigned_teachers', [])
        assigned_hrs = validated_data.pop('assigned_hrs', [])
        leave = Leave.objects.create(**validated_data)
        if leave.user.category == 'student':
            leave.assigned_teachers.set(assigned_teachers)
        elif leave.user.category == 'teacher':
            leave.assigned_hrs.set(assigned_hrs)
        leave.save()
        return leave

    def update(self, instance, validated_data):
        status = validated_data.get('status', instance.status)
        instance.status = status
        instance.save()
        return instance
