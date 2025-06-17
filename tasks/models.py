# tasks/models.py

from django.db import models
from django.contrib.auth.models import User

# カテゴリーモデル
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        # 管理画面などでの表示名を整える
        verbose_name = "カテゴリー"
        verbose_name_plural = "カテゴリー"

    def __str__(self):
        return self.name

# タスクモデル
class Task(models.Model):
    # 目標タイプの選択肢を定義
    class GoalType(models.TextChoices):
        LONG = 'LONG', '長期的目標'
        SHORT = 'SHORT', '短期的目標'
        HABIT = 'HABIT', '習慣化'

    # フィールドを定義
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField('タイトル', max_length=200)
    completed = models.BooleanField('完了', default=False)
    created_at = models.DateTimeField('作成日時', auto_now_add=True)
    due_date = models.DateField('締め切り日', null=True, blank=True)
    category = models.ForeignKey(Category, verbose_name='カテゴリー', on_delete=models.SET_NULL, null=True, blank=True)
    goal_type = models.CharField(
        '目標タイプ',
        max_length=5,
        choices=GoalType.choices,
        default=GoalType.SHORT
    )

    class Meta:
        verbose_name = "タスク"
        verbose_name_plural = "タスク"

    def __str__(self):
        return self.title