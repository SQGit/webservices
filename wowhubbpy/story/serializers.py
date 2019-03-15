from .models import Story, WowSome, WowSomeExtra, Comment, CommentExtra
from rest_framework import serializers

from users.serializers import CustomUserLimitedThirdPartySerializer


class StorySerializer(serializers.ModelSerializer):
    user = CustomUserLimitedThirdPartySerializer(read_only = True)

    class Meta:
        model = Story
        fields = ('id','story_description','story_location','cloud_image','cloud_video','cloud_thumb','file_type','interests','date_created','user')

class StoryWowsomeCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = WowSome
        fields = ('id','date_created')


class StoryWowsomeExtraSerializer(serializers.ModelSerializer):
    user = CustomUserLimitedThirdPartySerializer(read_only = True)

    class Meta:
        model = WowSomeExtra
        fields = ('id','wowsomed_on','user')


class StoryWowsomeLimitSerializer(serializers.ModelSerializer):
    wowsome = StoryWowsomeExtraSerializer(many=True,source='wowsomeextra_set')
    wowsome_count = serializers.SerializerMethodField()

    class Meta:
        model = WowSome
        fields = ('id','date_created','wowsome','wowsome_count')

    def get_wowsome_count(self,wowsome):
        return WowSomeExtra.objects.filter(wowsome=wowsome).count()


class StoryWowsomeFullSerializer(serializers.ModelSerializer):
    story = StorySerializer()
    wowsome = StoryWowsomeExtraSerializer(many=True,source='wowsomeextra_set')
    wowsome_count = serializers.SerializerMethodField()

    class Meta:
        model = WowSome
        fields = ('id','date_created','story','wowsome','wowsome_count')

    def get_wowsome_count(self,wowsome):
        return WowSomeExtra.objects.filter(wowsome=wowsome).count()


class StoryCommentCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = ('id','date_created')

class StoryCommentExtraSerializer(serializers.ModelSerializer):
    user = CustomUserLimitedThirdPartySerializer(read_only = True)

    class Meta:
        model = CommentExtra
        fields = ('id','commented_on','user','comment_description')


class StoryCommentLimitSerializer(serializers.ModelSerializer):
    comment = StoryCommentExtraSerializer(many=True,source='commentextra_set')
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id','date_created','comment','comment_count')

    def get_comment_count(self,comment):
        return CommentExtra.objects.filter(comment=comment).count()

class StoryCommentFullSerialzier(serializers.ModelSerializer):
    story = StorySerializer()
    comment = StoryCommentExtraSerializer(many=True,source='commentextra_set')
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id','date_created','story','comment','comment_count')

    def get_comment_count(self,comment):
        return CommentExtra.objects.filter(comment=comment).count()


class StoryShowSerializer(serializers.ModelSerializer):
    user = CustomUserLimitedThirdPartySerializer(read_only = True)
    wowsomes = StoryWowsomeLimitSerializer(read_only = True, many = True)
    comments = StoryCommentLimitSerializer(read_only=True, many = True)

    class Meta:
        model = Story
        fields = ('id','story_description','story_location','cloud_image','cloud_video','cloud_thumb','file_type','interests','date_created','user','wowsomes','comments')

class StoryCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Story
        fields = ('id','story_description','story_location','cloud_image','cloud_video','cloud_thumb','file_type','interests','date_created')

