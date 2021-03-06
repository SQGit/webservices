# Generated by Django 2.1.1 on 2018-12-07 12:44

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('story', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='story',
            name='file',
        ),
        migrations.AddField(
            model_name='story',
            name='cloud_image',
            field=models.CharField(max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name='story',
            name='cloud_thumb',
            field=models.CharField(max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name='story',
            name='cloud_video',
            field=models.CharField(max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name='story',
            name='interests',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), blank=True, default=list, size=None),
        ),
    ]
