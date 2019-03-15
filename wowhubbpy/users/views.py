from django.shortcuts import render

from .models import CustomUser, College, Follow, WorkExperience
from .serializers import CustomUserSerializer, CustomUserInterestsSerializer, CustomUserCollegeSerializer, CustomUserFollowSerializer, CustomUserOwnProfileSerializer, CustomUserWorkExperienceSerializer, CustomUserProfileFollowingSerializer, CustomUserProfileFollowerSerializer, CustomUserFullThirdPartySerializer

from django.http import Http404
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes,parser_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status

from rest_framework.permissions import AllowAny

from django.contrib.auth import authenticate
import jwt
from rest_framework_jwt.utils import jwt_payload_handler
from django.conf import settings

from django.core.mail import send_mail
import random

from .permissions import IsOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

from cloudinary import uploader
from rest_framework.parsers import MultiPartParser

# Create your views here.

class UserList(APIView):
    permission_classes=(AllowAny,)
    def get(self,request,format=None):
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def post(self,request,format=None):
        serializer = CustomUserSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class UserDetail(APIView):
    def get_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404
    
    def get(self,request,pk,format=None):
        user = self.get_object(pk)
        serializer = CustomUserSerializer(user)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def put(self,request,pk,format=None):
        user = self.get_object(pk)
        serializer = CustomUserSerializer(user,data=request.data)
        if serializer.is_valid():
            serializer.update()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class UserFollowing(APIView):
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get(self,request,format=None):
        current_user = request.user
        follows = Follow.objects.filter(follower_id=current_user)
        serializer = CustomUserProfileFollowingSerializer(follows,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def post(self,request,format=None):
        current_user = request.user
        user_id = request.user.id
        user_to_follow = request.data.get("user_to_follow")
        current_user_wowtagid = request.user.wowtagid
        if user_to_follow == None:
            return Response({'detail': 'Please provide user to follow'},status=status.HTTP_403_FORBIDDEN)
        elif int(user_to_follow) == user_id:
            return Response({'detail': "You can't follow yourself"},status=status.HTTP_403_FORBIDDEN)
        elif user_to_follow != None:
            user_to_follow = self.get_user_object(user_to_follow)
        user_to_follow_wowtagid = user_to_follow.wowtagid
        user_to_follow_username = user_to_follow.username
        serializer = CustomUserFollowSerializer(data={"user_to_follow":user_to_follow})
        check_follow = Follow.objects.filter(following_id=user_to_follow,follower_id=current_user)
        check_follow_count = len(check_follow)
        if check_follow_count >= 1:
            return Response({'detail':f'You are following {user_to_follow_username} already'},status=status.HTTP_403_FORBIDDEN)
        following_follower = "!" + user_to_follow_wowtagid + "!" + current_user_wowtagid
        if serializer.is_valid():
            serializer.save(following=user_to_follow,follower=current_user,following_follower=following_follower)
            return Response({'detail': f'You are now following {user_to_follow_username}'},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request,format=None):
        current_user = request.user
        user_id = request.user.id
        user_to_unfollow = request.data.get("user_to_unfollow")
        if user_to_unfollow == None:
            return Response({'detail': 'Please provide user to unfollow'},status=status.HTTP_403_FORBIDDEN)
        elif int(user_to_unfollow) == user_id:
            return Response({'detail': "You can't unfollow yourself"},status=status.HTTP_403_FORBIDDEN)
        elif user_to_unfollow != None:
            user_to_unfollow = self.get_user_object(user_to_unfollow)
        user_to_unfollow_username = user_to_unfollow.username
        check_follow = Follow.objects.filter(following_id=user_to_unfollow,follower_id=current_user)
        check_follow_count = len(check_follow)
        if check_follow_count < 1:
            return Response({'detail': f'You first have to follow {user_to_unfollow_username} before unfollow'},status=status.HTTP_403_FORBIDDEN)
        else:
            check_follow.delete()
            return Response({'detail': f'You are now unfollwing {user_to_unfollow_username}'})
        

class UserInterests(APIView):
    def get_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get(self,request,format=None):
        id = request.user.id
        user = self.get_object(pk=id)
        if user.first_time is True:
            user.first_time = False
        serializer = CustomUserInterestsSerializer(user)
        interests = serializer.data
        return Response({'detail': interests},status=status.HTTP_200_OK)

    def put(self,request,format = None):
        interests = request.data.get("interests")
        id = request.user.id
        user = self.get_object(pk=id)
        user.interests = interests
        user.update()
        return Response({'detail': 'Interests has been updated successfully'},status=status.HTTP_200_OK)

class UserCollegeList(APIView):
    permission_classes=(IsOwnerOrReadOnly,IsAuthenticated,)
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get_college_object(self,pk):
        try:
            return College.objects.get(pk=pk)
        except College.DoesNotExist:
            raise Http404

    def get(self,request,format=None):
        current_user = request.user
        colleges = College.objects.filter(user_id=current_user)
        serializer = CustomUserCollegeSerializer(colleges,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def post(self,request,format=None):
        serializer = CustomUserCollegeSerializer(data = request.data,many = True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



class UserCollegeDetail(APIView):
    permission_classes=(IsOwnerOrReadOnly,IsAuthenticated,)
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get_college_object(self,pk):
        try:
            return College.objects.get(pk=pk)
        except College.DoesNotExist:
            raise Http404

    def get(self,request,pk,format = None):
        college = self.get_college_object(pk=pk)
        serializer = CustomUserCollegeSerializer(college)
        data = serializer.data
        return Response({'detail': data},status=status.HTTP_200_OK)

    def put(self,request,pk,format = None):
        college = self.get_college_object(pk=pk)
        serializer = CustomUserCollegeSerializer(college,data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request,pk,format = None):
        college = self.get_college_object(pk=pk)
        college.delete()
        return Response({'detail':'College has been removed'},status=status.HTTP_204_NO_CONTENT)


class UserWorkExperienceList(APIView):
    permission_classes=(IsOwnerOrReadOnly,IsAuthenticated,)
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get_work_experience_object(self,pk):
        try:
            return WorkExperience.objects.get(pk=pk)
        except WorkExperience.DoesNotExist:
            raise Http404

    def get(self,request,format=None):
        current_user = request.user
        workexperiences = WorkExperience.objects.filter(user_id = current_user)
        serializer = CustomUserWorkExperienceSerializer(workexperiences,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def post(self,request,format=None):
        serializer = CustomUserWorkExperienceSerializer(data=request.data,many=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class UserWorkExperienceDetail(APIView):
    permission_classes=(IsOwnerOrReadOnly,IsAuthenticated,)
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def get_work_experience_object(self,pk):
        try:
            return WorkExperience.objects.get(pk=pk)
        except WorkExperience.DoesNotExist:
            raise Http404

    def get(self,request,pk,format = None):
        work_experience = self.get_work_experience_object(pk=pk)
        serializer = CustomUserWorkExperienceSerializer(work_experience)
        data = serializer.data
        return Response({'detail': data},status=status.HTTP_200_OK)

    def put(self,request,pk,format=None):
        work_experience = self.get_work_experience_object(pk=pk)
        serializer = CustomUserWorkExperienceSerializer(work_experience,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class ThirdPartyUserProfile(APIView):
    def get_user_object(self,pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise Http404

    def post(self,request,format=None):
        current_user = request.user
        current_user_id = current_user.id
        third_party_user_id = request.data.get('third_party_user_id')
        if not third_party_user_id:
            return Response({'detail': 'Provide third party user id'},status=status.HTTP_403_FORBIDDEN)
        third_party_user = self.get_user_object(pk=third_party_user_id)
        check_if_following = Follow.objects.filter(following_id=third_party_user_id,follower_id=current_user_id)
        third_party_user = self.get_user_object(pk=third_party_user_id)
        if not check_if_following:
            serializer = CustomUserFullThirdPartySerializer(third_party_user,context={"follow_status":"Not following"})
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            serializer = CustomUserFullThirdPartySerializer(third_party_user,context={"follow_status": "Following"})
            return Response(serializer.data,status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes((AllowAny,))
def register(request):
    serializer = CustomUserSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes((AllowAny,))
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    if email is None or password is None:
        return Response({'detail': 'Please provide Authentication Credentials'},
        status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(email=email,password=password)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        if user.verified is False:
            return Response({'detail': 'Not Verified'}, status=status.HTTP_403_FORBIDDEN)
        payload = jwt_payload_handler(user=user)
        token = jwt.encode(payload,settings.SECRET_KEY)
        serializer = CustomUserSerializer(user)
        return Response({'token': token, 'user': serializer.data},status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes((AllowAny,))
def generate_otp(request):
    email = request.data.get("email")
    if email is None:
        return Response({'detail': 'Please provide Authentication Credentials'},
        status=status.HTTP_400_BAD_REQUEST)
    check_users = CustomUser.objects.filter(email=email)
    if len(check_users) == 0:
        return Response({'detail': 'User not found. Please register with wowhubb first'},status = status.HTTP_400_BAD_REQUEST)
    check_user = check_users[0]
    otp = random.randint(1000,9999)
    check_user.verification_code = otp
    check_user.update()
    message = "Otp Verification code for wowhubb is " + str(otp) + "."
    send_mail('Wowhubb Otp',message,'otp@wowhubb.com',[email],fail_silently=False)
    return Response({'detail': 'Otp has been sent to your mail'},status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes((AllowAny,))
def verify_otp(request):
    email = request.data.get("email")
    password = request.data.get("password")
    otp = request.data.get("otp")
    if email is None or password is None:
        return Response({'detail': 'Please provide Authentication Credentials'},
        status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(email=email,password=password)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        check_otps = CustomUser.objects.filter(email=email,verification_code=otp)
        if len(check_otps) == 0:
            return Response({'detail': 'Wrong Otp. Please reenter the otp.'},status = status.HTTP_400_BAD_REQUEST)
        check_otp = check_otps[0]
        check_otp.verified = True
        check_otp.update()
        payload = jwt_payload_handler(user=user)
        token = jwt.encode(payload,settings.SECRET_KEY)
        serializer = CustomUserSerializer(user)
        return Response({'detail': 'Your wowhubb account is successfully verified','token': token, 'user': serializer.data},status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_cities(request):
    cities = request.data.get("cities")
    id = request.user.id
    user = CustomUser.objects.get(pk=id)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        user.cities = cities
        user.update()
        return Response({'detail': 'Cities has been updated successfully'},status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_relationship(request):
    relationship = request.data.get("relationship")
    id = request.user.id
    user = CustomUser.objects.get(pk=id)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        user.relationship = relationship
        user.update()
        return Response({'detail': 'Relationship has been updated successfully'},status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_lifeviews(request):
    dateofbirth = request.data.get("dateofbirth")
    gender = request.data.get("gender")
    id = request.user.id
    user = CustomUser.objects.get(pk=id)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        user.dateofbirth = dateofbirth
        user.gender = gender
        user.update()
        return Response({'detail': 'Life views has been updated successfully'},status=status.HTTP_200_OK)


@api_view(['PUT'])
def update_professional_skills(request):
    professional_skills = request.data.get("professional_skills")
    user_id = request.user.id
    user = CustomUser.objects.get(pk=id)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        user.professional_skills = professional_skills
        user.update()
        return Response({'detail': 'Professional Skills has been updated successfully'},status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_certifications(request):
    certifications = request.data.get("certifications")
    user_id = request.user.id
    user = CustomUser.objects.get(pk=id)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_200_OK)
    elif user:
        user.certifications = certifications
        user.update()
        return Response({'detail': 'Certifications has been updated successfully'},status=status.HTTP_200_OK)


@api_view(['GET'])
def get_own_profile(request):
    user_id = request.user.id
    user = CustomUser.objects.get(pk=user_id)
    serializer = CustomUserOwnProfileSerializer(user)
    return Response(serializer.data)



@api_view(['PUT'])
@parser_classes((MultiPartParser,))
def update_personal_self(request):
    user_id = request.user.id
    user = CustomUser.objects.get(pk=user_id)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        personal_self_video = None
        personal_self_thumb = None
        if 'personal_self' in request.FILES:
            video = request.FILES['personal_self']
            videoupload = uploader.upload(video,resource_type='video')
            version = videoupload['version']
            public_id = videoupload['public_id']
            format = videoupload['format']
            personal_self_video = 'http://res.cloudinary.com/www-wowhubb-com/video/upload/v' + str(version) + '/' + str(public_id) + '.' + format
            personal_self_thumb = 'http://res.cloudinary.com/www-wowhubb-com/video/upload/' + str(public_id) + '.jpg'
        user.personal_self_video = personal_self_video
        user.personal_self_thumb = personal_self_thumb
        user.update()
        return Response({'detail': 'Personal self intro video has been updated successfully','personal_self_video':personal_self_video,'personal_self_thumb':personal_self_thumb},status=status.HTTP_200_OK)
    


@api_view(['PUT'])
@parser_classes((MultiPartParser,))
def update_personal_image(request):
    user_id = request.user.id
    user = CustomUser.objects.get(pk=user_id)
    if not user:
        return Response({'detail': 'Invalid Credentials'},status=status.HTTP_404_NOT_FOUND)
    elif user:
        personal_image = None
        if 'personal_image' in request.FILES:
            image = request.FILES['personal_image']
            imageupload = uploader.upload(image)
            personal_image = imageupload['url']
        user.personal_image = personal_image
        user.update()
        return Response({'detail': 'Personal image has been updated successfully','personal_image':personal_image},status=status.HTTP_200_OK)


@api_view(['GET'])
def user_follower(request):
    current_user = request.user
    follows = Follow.objects.filter(following_id=current_user)
    serializer = CustomUserProfileFollowerSerializer(follows,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes((AllowAny,))
def api(request,format = None):
    return Response({
        'register': reverse('register',request=request,format=format),
        'login': reverse('login',request=request,format=format),
        'stories': reverse('story-list',request=request,format=format),
        'interests': reverse('interests',request=request,format=format),
        'update_cities': reverse('update-cities',request=request,format=format),
        'update_relationship': reverse('update-relationship',request=request,format=format),
        'update_lifeviews': reverse('update-lifeviews',request=request,format=format),
        'colleges': reverse('college-list',request=request,format=format),
        'work_experiences': reverse('work-experience-list',request=request,format=format),
        'user_following': reverse('user-following',request=request,format=format),
        'user_follower': reverse('user-follower',request=request,format=format),
        'get_own_profile': reverse('get-own-profile',request=request,format=format),
        'get_third_party_user_profile': reverse('get-third-party-user-profile',request=request,format=format),
        'update_personal_self': reverse('update-personal-self',request=request,format=format),
        'update_personal_image': reverse('update-personal-image',request=request,format=format),
        'wowsome': reverse('wowsome',request=request,format=format),
        'comment': reverse('comment',request=request,format=format),
    })