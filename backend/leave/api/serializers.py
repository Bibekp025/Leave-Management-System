from rest_framework import serializers
from ..models import Leave, LeaveType
from user.models import User

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'type', 'name']


class LeaveSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    approved_by = serializers.StringRelatedField(read_only=True)
    leave_type = LeaveTypeSerializer(read_only=True)
    leave_type_id = serializers.PrimaryKeyRelatedField(
        queryset=LeaveType.objects.all(), source='leave_type', write_only=True
    )

    class Meta:
        model = Leave
        fields = [
            'id', 'user', 'leave_type', 'leave_type_id',
            'start_date', 'end_date', 'reason', 'status',
            'applied_on', 'approved_by', 'approved_on',
            'number_of_days', 'assigned_teachers'
        ]
        read_only_fields = ['status', 'applied_on', 'approved_by', 'approved_on', 'number_of_days']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Optionally restrict status update logic here if needed
        return super().update(instance, validated_data)
