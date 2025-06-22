# tasks/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, CategoryViewSet, GoalViewSet

router = DefaultRouter() #URLの自動生成
router.register(r'tasks', TaskViewSet) 
router.register(r'categories', CategoryViewSet)
# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
# --- GoalViewSetのURLを新しく登録 ---
# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
]