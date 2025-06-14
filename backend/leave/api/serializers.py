from rest_framework import serializers
from ..models import Leave, LeaveType
from user.models import User


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'type', 'name']


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class LeaveSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    approved_by = UserMinimalSerializer(read_only=True)
    leave_type = LeaveTypeSerializer(read_only=True)
    
    leave_type_id = serializers.PrimaryKeyRelatedField(
        queryset=LeaveType.objects.all(), source='leave_type', write_only=True
    )
    
    assigned_teachers = serializers.PrimaryKeyRelatedField(
    queryset=User.objects.filter(category="teacher"),  # ❌ Case-sensitive and might be excluding
    many=True,
    required=False
)

    assigned_teacher_names = serializers.SerializerMethodField()

    class Meta:
        model = Leave
        fields = [
            'id', 'user', 'leave_type', 'leave_type_id',
            'start_date', 'end_date', 'reason', 'status',
            'applied_on', 'approved_by', 'approved_on',
            'number_of_days', 'assigned_teachers', 'assigned_teacher_names'
        ]
        read_only_fields = ['status', 'applied_on', 'approved_by', 'approved_on', 'number_of_days']

    def get_assigned_teacher_names(self, obj):
        return [teacher.username for teacher in obj.assigned_teachers.all()]

    def create(self, validated_data):
        assigned_teachers = validated_data.pop('assigned_teachers', [])
        validated_data['user'] = self.context['request'].user
        leave = Leave.objects.create(**validated_data)
        leave.assigned_teachers.set(assigned_teachers)
        return leave

    def update(self, instance, validated_data):
        assigned_teachers = validated_data.pop('assigned_teachers', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if assigned_teachers is not None:
            instance.assigned_teachers.set(assigned_teachers)

        instance.save()
        return instance
