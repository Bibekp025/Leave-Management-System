from ..models import User
from .serializers import (
    UserLoginSerializer,
    UserLogoutSerializer,
    UserSerializer,
    UserWriteSerializer
)
from rest_framework.generics import (
    GenericAPIView,
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView
)
from rest_framework.response import Response

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from rest_framework.authtoken.models import Token

from rest_framework import filters 
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status





class UserCreateView(CreateAPIView):
    serializer_class=UserWriteSerializer
    queryset = User.objects.all()  # Required for DRF safety



    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        else:
            # Collect all error messages into one string
            error_messages = []
            for field, errors in serializer.errors.items():
                error_messages.extend(errors)
            return Response(
                {"message": " ".join(error_messages)},
                status=status.HTTP_400_BAD_REQUEST
            )
    

class UserUpdateView(UpdateAPIView):
    serializer_class=UserWriteSerializer
    authentication_classes=[TokenAuthentication]
    permission_classes=[IsAuthenticated]
    def get_object(self):
        return self.request.user
    
class UserListView(ListAPIView):
    serializer_class=UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']
    queryset=User.objects.all()

class UserSelfView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserRetrieveView(RetrieveAPIView):
    serializer_class=UserSerializer
    queryset=User.objects.all()
    lookup_field='pk'
    
class UserLoginView(GenericAPIView):
    def post(self, request, *args, **kwargs):
        serializer=UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username=serializer.validated_data.get('username')
        password=serializer.validated_data.get('password')
        try:
            user=User.objects.get(username=username)
        except:
            return Response({
                'message':'Invalid Credentials'
            })
        if not user.check_password(password):
            return Response({
                'message':'Invalid Credentials'
            })
        token,create=Token.objects.get_or_create(user=user)
        return Response({
            'message':'Successfully Logged In',
            'token':token.key
        })
class UserLogoutView(GenericAPIView):
    authentication_classes=[IsAuthenticated]
    permission_classes=[TokenAuthentication]
    def post(self, request, *args, **kwargs):
        serializer=UserLogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_token=serializer.validated_data.get('token')
        try:
            token=Token.objects.get(key=user_token)
            token.delete()
            return Response({
                'message':'Logged Out Successfully'
            })
        except:
            return Response({
                'message':'Invalid Credentials'
            })


    