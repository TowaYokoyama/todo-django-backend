from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) #引数であるユーザークラスと紐づき存在する
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "カテゴリー"
        verbose_name_plural = "カテゴリー"

    def __str__(self):
        return self.name

class Task(models.Model):
    # 目標タイプの選択肢
    class GoalType(models.TextChoices):
        LONG = 'LONG', '長期的目標'
        SHORT = 'SHORT', '短期的目標'
        HABIT = 'HABIT', '習慣化'

    # 私の提案：優先度の選択肢
    class Priority(models.IntegerChoices):
        LOW = 1, '低'
        MEDIUM = 2, '中'
        HIGH = 3, '高'

    # --- フィールド定義 ---
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField('タイトル', max_length=200)
    
    # 私の提案：詳細な説明文を追加
    description = models.TextField('詳細', null=True, blank=True)

    completed = models.BooleanField('完了', default=False)
    created_at = models.DateTimeField('作成日時', auto_now_add=True)
    due_date = models.DateField('締め切り日', null=True, blank=True)
    category = models.ForeignKey(Category, verbose_name='カテゴリー', on_delete=models.SET_NULL, null=True, blank=True)
    
    # あなたのアイデア：目標タイプ
    goal_type = models.CharField(
        '目標タイプ',
        max_length=5,
        choices=GoalType.choices,
        default=GoalType.SHORT
    )
    
    # 私の提案：優先度
    priority = models.IntegerField(
        '優先度',
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    class Meta:
        verbose_name = "タスク"
        verbose_name_plural = "タスク"

    def __str__(self):
        return self.title