from django.db import models

from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Story(models.Model):
    story_description = models.CharField(max_length=300,blank=True,default='')
    story_location = models.CharField(max_length=300,blank=True,default='')
    date_created = models.DateTimeField(auto_now_add=True)
    cloud_image = models.CharField(max_length = 1000,null = True)
    cloud_video = models.CharField(max_length = 1000,null = True)
    cloud_thumb = models.CharField(max_length = 1000,null = True)
    file_type = models.CharField(max_length=100,blank=True,default='')
    interests = ArrayField(
        models.CharField(max_length = 100), blank = True, default = list
    )
    date_created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('users.CustomUser',on_delete=models.CASCADE,related_name='stories',null = True)
    cloud_image = models.CharField(max_length = 1000,null = True)
    cloud_video = models.CharField(max_length = 1000,null = True)
    cloud_thumb = models.CharField(max_length = 1000,null = True)

    class Meta:
        ordering = ('date_created',)

    def __str__(self):
        return self.story_description

class WowSome(models.Model):
    story = models.ForeignKey(Story,related_name='wowsomes',on_delete=models.DO_NOTHING)
    wowsome_users = models.ManyToManyField('users.CustomUser',related_name='wowsome_users',through='WowSomeExtra')
    date_created = models.DateTimeField(auto_now_add=True)

class WowSomeExtra(models.Model):
    user = models.ForeignKey('users.CustomUser',on_delete=models.CASCADE)
    wowsome = models.ForeignKey(WowSome,on_delete=models.CASCADE)
    wowsomed_on = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    story = models.ForeignKey(Story,related_name='comments',on_delete=models.DO_NOTHING)
    comment_users = models.ManyToManyField('users.CustomUser',related_name='comment_users',through='CommentExtra')
    date_created = models.DateTimeField(auto_now_add=True)

class CommentExtra(models.Model):
    user = models.ForeignKey('users.CustomUser',on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment,on_delete=models.CASCADE)
    comment_description = models.CharField(max_length=2000,blank=False)
    commented_on = models.DateTimeField(auto_now_add=True)