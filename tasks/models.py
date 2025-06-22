

from django.db import models
from django.contrib.auth.models import User

# --- Categoryモデル (変更なし) ---
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "カテゴリー"
        verbose_name_plural = "カテゴリー"

    def __str__(self):
        return self.name

# ★★★★★★★★★★★★★★★★★★★★★★★★★
# --- Goalモデル (これを新しく追加) ---
# ★★★★★★★★★★★★★★★★★★★★★★★★★
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField('目標名', max_length=200)
    description = models.TextField('詳細', blank=True, null=True)
    created_at = models.DateTimeField('作成日時', auto_now_add=True)
    updated_at = models.DateTimeField('更新日時', auto_now=True)

    class Meta:
        verbose_name = "目標"
        verbose_name_plural = "目標"

    def __str__(self):
        return self.name


# --- Taskモデル (goalフィールドを1つ追加) ---
class Task(models.Model):
    # GoalType と Priority の定義は素晴らしいので、そのまま使います
    class GoalType(models.TextChoices):
        LONG = 'LONG', '長期的目標'
        SHORT = 'SHORT', '短期的目標'
        HABIT = 'HABIT', '習慣化'

    class Priority(models.IntegerChoices):
        LOW = 1, '低'
        MEDIUM = 2, '中'
        HIGH = 3, '高'

    # --- フィールド定義 ---
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField('タイトル', max_length=200)
    description = models.TextField('詳細', null=True, blank=True)
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
    priority = models.IntegerField(
        '優先度',
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    # ★★★★★★★★★★★★★★★★★★★★★★★★★
    # --- この goal フィールドを追加します ---
    # ★★★★★★★★★★★★★★★★★★★★★★★★★
    # どの具体的な「目標」に属するかを紐付けるための設定
    # 目標は設定しなくても良い（null=True, blank=True）
    goal = models.ForeignKey(Goal, verbose_name='親目標', on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')

    class Meta:
        verbose_name = "タスク"
        verbose_name_plural = "タスク"

    def __str__(self):
        return self.title