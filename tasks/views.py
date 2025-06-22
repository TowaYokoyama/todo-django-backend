# tasks/views.py

from rest_framework import viewsets, permissions # permissions を直接インポート
from .models import Task, Category, Goal
from .serializers import TaskSerializer, CategorySerializer, GoalSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated] # ← ここはOKです！

    # ★★★★★ これが必要です！この関数を追加してください ★★★★★
    def perform_create(self, serializer):
        """新しいカテゴリーが作成される際に、自動でリクエストユーザーをセットする"""
        serializer.save(user=self.request.user)

    # ★★★★★ こちらも追加してください ★★★★★
    def get_queryset(self):
        """ログインしているユーザー自身のカテゴリーのみを返すようにする"""
        # 親クラスのquerysetをベースに、ログインユーザーで絞り込む
        return super().get_queryset().filter(user=self.request.user)


# (↓ TaskViewSetは参考までにそのままにしておきます)
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
     # ★★★★★ ここからがタスク用の修正箇所です ★★★★★
    def perform_create(self, serializer):
        """新しいタスクが作成される際に、自動でリクエストユーザーをセットする"""
        serializer.save(user=self.request.user)

    # ★★★★★ こちらもタスク用に修正してください ★★★★★
    def get_queryset(self):
        """ログインしているユーザー自身のタスクのみを返すようにする"""
        return self.queryset.filter(user=self.request.user)
    
    # ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
# --- GoalViewSetを新しく追加 ---
# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
class GoalViewSet(viewsets.ModelViewSet):
    """
    目標の参照、作成、更新、削除を行うためのAPIビュー
    """
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        このビューセットで返されるクエリセットをカスタマイズする。
        ログインしているユーザー自身の目標のみを返す。
        """
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        新しい目標が作成される際に、自動でリクエストユーザーをセットする。
        """
        serializer.save(user=self.request.user)
