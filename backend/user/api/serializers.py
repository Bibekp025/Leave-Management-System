from ..models import User
from django.contrib.auth.hashers import make_password,check_password
from rest_framework.response import Response
from rest_framework import serializers

class UserWriteSerializer(serializers.ModelSerializer):
    class Meta:
        fields='__all__'
        model=User

    def create(self, validated_data):
        password=validated_data.pop('password')
        
        user=User.objects.create(**validated_data)

        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        
        old_password=instance.password
        if 'password' in validated_data:
            password_instace=instance.password
            if not check_password(validated_data['password'], instance.password):
                validated_data['password'] = make_password(validated_data['password'])
            else:
                raise serializers.ValidationError({"password": "New password cannot be the same as the old password."})
    
        return super().update(instance, validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=[
            'id','username','first_name','email'
        ]

class UserLoginSerializer(serializers.Serializer):
    username=serializers.CharField(required=True)
    password=serializers.CharField(required=True)

class UserLogoutSerializer(serializers.Serializer):
    token=serializers.CharField(required=True)