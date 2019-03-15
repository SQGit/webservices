from django.shortcuts import render

# Create your views here.

from .models import Story, WowSome, WowSomeExtra, Comment, CommentExtra
from users.models import CustomUser
from .serializers import StoryCreateSerializer,StoryShowSerializer, StoryWowsomeCreateSerializer, StoryWowsomeFullSerializer, StoryWowsomeExtraSerializer, StoryCommentCreateSerializer, StoryCommentFullSerialzier, StoryCommentExtraSerializer

from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.parsers import MultiPartParser,FormParser

from .permissions import IsOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated 

from cloudinary import uploader

class StoryList(APIView):
    permission_classes=(IsAuthenticatedOrReadOnly,IsOwnerOrReadOnly,)
    def get(self,request,format = None):
        stories = Story.objects.all().reverse()
        serializer = StoryShowSerializer(stories,many=True)
        return Response(serializer.data)

    def post(self,request,*args,**kwargs):
        parser_classes = (MultiPartParser,FormParser)
        cloud_image = None
        cloud_video = None
        cloud_thumb = None
        if 'cloud_image' in request.FILES:
            image = request.FILES['cloud_image']
            imageupload = uploader.upload(image)
            cloud_image = imageupload['url']
        if 'cloud_video' in request.FILES:
            video = request.FILES['cloud_video']
            videoupload = uploader.upload(video,resource_type='video')
            version = videoupload['version']
            public_id = videoupload['public_id']
            format = videoupload['format']
            cloud_video = 'http://res.cloudinary.com/www-wowhubb-com/video/upload/v' + str(version) + '/' + str(public_id) + '.' + format
            cloud_thumb = 'http://res.cloudinary.com/www-wowhubb-com/video/upload/' + str(public_id) + '.jpg'
        newdata = request.data
        newdata._mutable = True
        newdata['cloud_image'] = cloud_image
        newdata['cloud_video'] = cloud_video
        newdata['cloud_thumb'] = cloud_thumb
        serializer = StoryCreateSerializer(data = newdata)
        if serializer.is_valid():
            serializer.save(user = request.user)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class StoryDetail(APIView):
    permission_classes=(IsAuthenticatedOrReadOnly,IsOwnerOrReadOnly,)
    def get_object(self,pk):
        try:
            return Story.objects.get(pk=pk)
        except Story.DoesNotExist:
            raise Http404

    def get(self,request,pk,format=None):
        story = self.get_object(pk)
        serializer = StoryShowSerializer(story)
        return Response(serializer.data)

    def put(self,request,pk,format=None):
        story = self.get_object(pk)
        serializer = StoryCreateSerializer(story,data=request.data)
        if serializer.is_valid():
            serializer.save(user = request.user)
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class StoryWowsome(APIView):
    permission_classes=(IsAuthenticatedOrReadOnly,)
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get_story_object(self,story_id):
        try:
            return Story.objects.get(pk=story_id)
        except Story.DoesNotExist:
            raise Http404

    def check_story_wowsome(self,story_id):
        try:
            return WowSome.objects.get(story_id=story_id)
        except WowSome.DoesNotExist:
            return None

    def check_story_wowsome_extra(self,user_id,wowsome_id):
        try:
            return WowSomeExtra.objects.get(user_id=user_id,wowsome_id=wowsome_id)
        except WowSomeExtra.DoesNotExist:
            return None


    def post(self,request,format=None):
        current_user = request.user
        current_user_id = current_user.id
        story_id = request.data.get("story_id")
        if story_id == None:
            return Response({'detail': 'Please provide story id'},status=status.HTTP_403_FORBIDDEN)
        story = self.get_story_object(story_id=story_id)
        story_user_id = story.user.id
        if current_user_id == story_user_id: 
            return Response({'detail': "You can't wowsome your own story"},status=status.HTTP_403_FORBIDDEN)
        check_story_wowsome = self.check_story_wowsome(story_id=story_id)
        if check_story_wowsome == None:
            serializer = StoryWowsomeCreateSerializer(data={})
            if serializer.is_valid():
                wowsome = serializer.save(story=story)
                wowsome_id = wowsome.id
                check_story_wowsome_extra = self.check_story_wowsome_extra(user_id=current_user_id,wowsome_id=wowsome_id)
                if check_story_wowsome_extra == None:
                    WowSomeExtra.objects.create(user_id=current_user_id,wowsome_id=wowsome_id)
                    return Response({'detail': 'Story wowsommed successfully'},status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            wowsome_id = check_story_wowsome.id
            check_story_wowsome_extra = self.check_story_wowsome_extra(user_id=current_user_id,wowsome_id=wowsome_id)
            if check_story_wowsome_extra != None:
                return Response({'detail': 'You have already wowsomed this story'},status=status.HTTP_403_FORBIDDEN)
            WowSomeExtra.objects.create(user_id=current_user_id,wowsome_id=wowsome_id)
            return Response({'detail': 'Story wowsommed successfully'},status=status.HTTP_200_OK)


class StoryComment(APIView):
    permission_classes=(IsAuthenticatedOrReadOnly,)
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get_story_object(self,story_id):
        try:
            return Story.objects.get(pk=story_id)
        except Story.DoesNotExist:
            raise Http404

    def check_story_comment(self,story_id):
        try:
            return Comment.objects.get(story_id=story_id)
        except Comment.DoesNotExist:
            return None

    
    def post(self,request,format=None):
        current_user = request.user
        current_user_id = current_user.id
        story_id = request.data.get("story_id")
        comment_description = request.data.get("comment_description")
        if story_id == None:
            return Response({'detail': 'Please Provide story id'},status=status.HTTP_403_FORBIDDEN)
        if comment_description == None:
            return Response({'detail': 'Please Provide comment description'},status=status.HTTP_403_FORBIDDEN)
        if comment_description == "":
            return Response({'detail': 'Please Provide comment description'},status=status.HTTP_403_FORBIDDEN) 
        story = self.get_story_object(story_id=story_id)
        story_user_id = story.user.id
        check_story_comment = self.check_story_comment(story_id=story_id)
        if check_story_comment == None:
            serializer = StoryCommentCreateSerializer(data={})
            if serializer.is_valid():
                comment = serializer.save(story=story)
                comment_id = comment.id
                CommentExtra.objects.create(user_id=current_user_id,comment_id=comment_id,comment_description=comment_description)
                return Response({'detail': 'Story Commented successfully'},status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        else:
            comment_id = check_story_comment.id
            CommentExtra.objects.create(user_id=current_user_id,comment_id=comment_id,comment_description=comment_description)
            return Response({'detail': 'Story Commented successfully'},status=status.HTTP_200_OK)