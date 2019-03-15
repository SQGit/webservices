from .models import CustomUser,College,WorkExperience,Follow
from rest_framework import serializers

from story.models import Story

class CustomUserStoryRelateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Story
        fields = ('id','story_description','story_location','cloud_image','cloud_video','cloud_thumb','file_type','interests','date_created')


class CustomUserCollegeSerializer(serializers.ModelSerializer):

    class Meta:
        model = College
        fields = ('id','college_name','degree','field_of_study','grade','from_year','to_year','description')

class CustomUserWorkExperienceSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkExperience
        fields = ('id','title','company_name','location','from_year','to_year','description')

class CustomUserProfileSerializer(serializers.ModelSerializer):
    colleges = CustomUserCollegeSerializer(many = True,read_only=True)
    work_experiences = CustomUserWorkExperienceSerializer(many = True,read_only= True)

    class Meta:
        model = CustomUser
        fields = ('id','wowtagid','email','first_name','last_name','phone','date_of_birth','gender','cities','relationship','personal_image','personal_self_video','personal_self_thumb','designation','colleges','work_experiences','professional_skills','certifications')

class CustomUserFollowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Follow
        fields = ('id','follow_at')
    
        
class CustomUserProfileFollowingSerializer(serializers.ModelSerializer):
    following = CustomUserProfileSerializer()

    class Meta:
        model = Follow
        fields = ('id','follow_at','following')
        depth = 1

class CustomUserProfileFollowerSerializer(serializers.ModelSerializer):
    follower = CustomUserProfileSerializer()

    class Meta:
        model = Follow
        fields = ('id','follow_at','follower')
        depth = 1

    
class CustomUserInterestsSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ('id','interests')


class CustomUserLimitedThirdPartySerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ('id','wowtagid','personal_image','designation','email','first_name','last_name','phone','gender','personal_self_video','personal_self_thumb')


class CustomUserFullThirdPartySerializer(serializers.ModelSerializer):
    colleges = CustomUserCollegeSerializer(many = True,read_only=True)
    work_experiences = CustomUserWorkExperienceSerializer(many = True,read_only= True)
    followings = CustomUserProfileFollowingSerializer(many = True,read_only=True)
    followers = CustomUserProfileFollowerSerializer(many = True,read_only=True)
    followings_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    follow_status = serializers.SerializerMethodField()
    stories = CustomUserStoryRelateSerializer(many=True,read_only=True)
    stories_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id','wowtagid','email','first_name','last_name','phone','date_of_birth','gender','interests','first_time','cities','colleges','work_experiences','designation','professional_skills','certifications','relationship','personal_image','personal_self_video','personal_self_thumb','followings','followers','followings_count','followers_count','follow_status','stories','stories_count')

    def get_followings_count(self,obj):
        return obj.followings.count()

    def get_followers_count(self,obj):
        return obj.followers.count()

    def get_follow_status(self,obj):
        if "follow_status" in self.context:
            return self.context["follow_status"]
        return None

    def get_stories_count(self,obj):
        return obj.stories.count()


class CustomUserOwnProfileSerializer(serializers.ModelSerializer):
    colleges = CustomUserCollegeSerializer(many = True,read_only=True)
    work_experiences = CustomUserWorkExperienceSerializer(many = True,read_only= True)
    followings = CustomUserProfileFollowingSerializer(many = True,read_only=True)
    followers = CustomUserProfileFollowerSerializer(many = True,read_only=True)
    followings_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    stories = CustomUserStoryRelateSerializer(many=True,read_only=True)
    stories_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id','wowtagid','email','first_name','last_name','phone','date_of_birth','gender','interests','first_time','cities','colleges','work_experiences','designation','professional_skills','certifications','relationship','personal_image','personal_self_video','personal_self_thumb','followings','followers','followings_count','followers_count','stories','stories_count')

    def get_followings_count(self,obj):
        return obj.followings.count()

    def get_followers_count(self,obj):
        return obj.followers.count()

    def get_stories_count(self,obj):
        return obj.stories.count()


class CustomUserSerializer(serializers.ModelSerializer):
    colleges = CustomUserCollegeSerializer(many = True,read_only=True)
    work_experiences = CustomUserWorkExperienceSerializer(many = True,read_only= True)
    followings = CustomUserProfileFollowingSerializer(many = True,read_only=True)
    followers = CustomUserProfileFollowerSerializer(many = True,read_only=True)
    followings_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id','wowtagid','email','first_name','last_name','password','phone','date_of_birth','gender','interests','first_time','cities','colleges','work_experiences','designation','professional_skills','certifications','relationship','personal_image','personal_self_video','personal_self_thumb','followings','followers','followings_count','followers_count')
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_followings_count(self,obj):
        return obj.followings.count()

    def get_followers_count(self,obj):
        return obj.followers.count()


    
 
