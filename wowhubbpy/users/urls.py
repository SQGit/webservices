from django.conf.urls import url,include
from . import views

from story import views as storyviews

from rest_framework.urlpatterns import format_suffix_patterns

from django.contrib import admin


urlpatterns = format_suffix_patterns([
    url(r'^$',views.api),
    url(r'^users/$',views.UserList.as_view(),name='user-list'),
    url(r'^users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view(), name='user-detail'),
    url(r'^stories/$',storyviews.StoryList.as_view(), name='story-list'),
    url(r'^stories/(?P<pk>[0-9]+)/$',storyviews.StoryDetail.as_view(), name='story-detail'),
    url(r'^register/$', views.register, name='register'),
    url(r'^login/$', views.login, name='login'),
    url(r'^generateotp/$', views.generate_otp, name='generate-otp'),
    url(r'^verifyotp/$', views.verify_otp, name='verify-otp'),
    url(r'^interests/$',views.UserInterests.as_view(),name='interests'),
    url(r'^update_cities/$',views.update_cities, name='update-cities'),
    url(r'^update_relationship/$',views.update_relationship, name='update-relationship'),
    url(r'^update_lifeviews/$',views.update_lifeviews, name='update-lifeviews'),
    url(r'^colleges/$',views.UserCollegeList.as_view(), name='college-list'),
    url(r'^colleges/(?P<pk>[0-9]+)/$',views.UserCollegeDetail.as_view(), name='college-detail'),
    url(r'^work_experiences/$',views.UserWorkExperienceList.as_view(), name='work-experience-list'),
    url(r'^work_experiences/(?P<pk>[0-9]+)/$',views.UserWorkExperienceDetail.as_view(), name='work-experience-detail'),
    url(r'^update_professional_skills/$',views.update_professional_skills, name='update-professional-skills'),
    url(r'^update_certifications/$',views.update_certifications,name='update-certifications'),
    url(r'^user_following/$',views.UserFollowing.as_view(),name='user-following'),
    url(r'^user_follower/$',views.user_follower,name='user-follower'),
    url(r'^get_own_profile/$',views.get_own_profile,name='get-own-profile'),
    url(r'^get_third_party_user_profile/$',views.ThirdPartyUserProfile.as_view(),name='get-third-party-user-profile'),
    url(r'^update_personal_self/$',views.update_personal_self,name='update-personal-self'),
    url(r'^update_personal_image/$',views.update_personal_image,name='update-personal-image'),
    url(r'^wowsome/$',storyviews.StoryWowsome.as_view(),name='wowsome'),
    url(r'^comment/$',storyviews.StoryComment.as_view(),name='comment'),
])



