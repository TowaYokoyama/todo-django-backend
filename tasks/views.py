from django.shortcuts import render
#データべースからタスクのデータをすべて取り出す
#そのデータをJSON形式に変換し、
#変換したJSONをレスポンスとしてアプリに送り出す
# Create your views here.

from rest_framework import viewsets , permissions
from .models import Task , Category
from .serializers import TaskSerializer , CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):  # ← 修正済み！
    queryset = Category.objects.all() #データの範囲を取り決める
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all() #データの範囲を取り決める
    serializer_class = TaskSerializer
    per_mission_class = [permissions.AllowAny]
    
    #誰でも許可
    #たったこれだけのコードでGET POST GET PUT /PATCh DELETEができる！