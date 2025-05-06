from django.urls import path
from .views import (
    UserCreateView,
    UserListView,
    UserLoginView,
    UserLogoutView,
    UserRetrieveView,
    UserUpdateView
)
urlpatterns = [
    path('create/',UserCreateView.as_view()),
    path('',UserListView.as_view()),
    path('login/',UserLoginView.as_view()),
    path('logout/',UserLogoutView.as_view()),
    path('<int:pk>/',UserRetrieveView.as_view()),
    path('update/',UserUpdateView.as_view())
]