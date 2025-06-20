# tasks/serializers.py
#フロントエンドで理解できるjson形式の翻訳機的な働き

from rest_framework import serializers
from .models import Task, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'completed',
            'priority',
            'due_date',
            'category',
            'goal_type',
            'user',
            'created_at',
            ] 
        #userはタスク作成更新時に自動で設定されるので、
        #APi経由で直接書き換えられないように、「読み取り専用」にしておくと安全
        read_only_fields = ['user']