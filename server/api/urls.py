from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, ReminderDetailAPIView, ReminderListCreateAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('reminders/<int:pk>/', ReminderDetailAPIView.as_view()),
    path('reminders/', ReminderListCreateAPIView.as_view(), name='reminder-list-create'),
]
