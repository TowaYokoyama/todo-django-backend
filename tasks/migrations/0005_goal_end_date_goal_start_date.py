# Generated by Django 5.2.3 on 2025-06-22 22:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0004_goal_task_goal'),
    ]

    operations = [
        migrations.AddField(
            model_name='goal',
            name='end_date',
            field=models.DateField(blank=True, null=True, verbose_name='終了日'),
        ),
        migrations.AddField(
            model_name='goal',
            name='start_date',
            field=models.DateField(blank=True, null=True, verbose_name='開始日'),
        ),
    ]
