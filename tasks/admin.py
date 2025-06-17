from django.contrib import admin

# Register your models here.
# tasks/admin.py
from .models import Task, Category # .models は「同じフォルダにあるmodels.py」という意味

# Register your models here.
admin.site.register(Task)
admin.site.register(Category)