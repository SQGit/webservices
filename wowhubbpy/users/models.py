from django.db import models
from django.contrib.auth.models import AbstractUser

from .validators import WowtagIdValidator, PhoneNumberValidator

from django.contrib.postgres.fields import ArrayField,JSONField

GENDER_CHOICES = (('Male','Male'),('Female','Female'))

# Create your models here.

class CustomUser(AbstractUser):

    wowtagid_validator = WowtagIdValidator()
    phone_validator = PhoneNumberValidator()

    wowtagid = models.CharField(
        max_length=150,
        unique=True,
        validators=[wowtagid_validator],
        error_messages= {
            'unique': "A user with that wowtagid already exists.",
        },
    )
    email = models.EmailField(
        unique=True,
        error_messages= {
            'unique': "A user with that email already exists.",
        },
    )
    first_name = models.CharField(max_length=150, blank = True)
    last_name = models.CharField(max_length=150, blank = True)
    username = models.CharField(
        max_length=350,
        blank = True,
        default = "",
    )
    phone = models.CharField(
        max_length = 17,
        validators = [phone_validator],
        unique = True,
        error_messages = {
            'unique': "A user with that phone number already exists."
        },
    )
    date_of_birth = models.DateField(max_length = 8, null = True)
    gender = models.CharField(choices = GENDER_CHOICES, default = 'Male', max_length = 15)
    verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length = 8, null = True)
    designation = models.CharField(max_length = 200,null = True)
    interests = ArrayField(
        models.CharField(max_length = 200), blank = True, default = list
    )
    first_time = models.BooleanField(default=True)
    cities = JSONField(default = list)
    relationship = JSONField(default = list)
    professional_skills = ArrayField(
        models.CharField(max_length = 200), blank = True, default = list
    )
    certifications = JSONField(default=list)
    personal_image = models.CharField(max_length = 1000, null = True)
    personal_self_video = models.CharField(max_length = 1000, null = True)
    personal_self_thumb = models.CharField(max_length = 1000, null = True)

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        self.username = self.first_name + " " + self.last_name
        self.set_password(self.password)
        super(CustomUser, self).save(*args, **kwargs)

    def update(self, *args, **kwargs):
        self.username = self.first_name + " " + self.last_name
        super(CustomUser, self).save(*args, **kwargs)

class College(models.Model):

    college_name = models.CharField(max_length = 500,blank = True)
    degree = models.CharField(max_length = 300, blank = True)
    field_of_study = models.CharField(max_length = 300, blank = True)
    grade = models.CharField(max_length = 100, blank = True)
    from_year = models.PositiveSmallIntegerField(blank = True, null = True)
    to_year = models.PositiveSmallIntegerField(blank = True, null = True)
    description = models.CharField(max_length = 600, null = True)
    user = models.ForeignKey(CustomUser,related_name="colleges", on_delete = models.CASCADE)

    def __str__(self):
        return self.college_name

    def save(self, *args, **kwargs):
        super(College,self).save(*args, **kwargs)

    def update(self,*args, **kwargs):
        super(College,self).save(*args, **kwargs)

class WorkExperience(models.Model):

    title = models.CharField(max_length = 300, blank = True)
    company_name = models.CharField(max_length = 300, blank = True)
    location = models.CharField(max_length = 200, blank = True)
    from_year = models.PositiveIntegerField(blank = True, null = True)
    to_year = models.PositiveIntegerField(blank = True, null = True)
    description = models.CharField(max_length = 600, null = True)
    user = models.ForeignKey(CustomUser,related_name="work_experiences", on_delete = models.CASCADE)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super(WorkExperience,self).save(*args, **kwargs)

    def update(self, *args, **kwargs):
        super(WorkExperience,self).save(*args, **kwargs)



class Follow(models.Model):
    following = models.ForeignKey(CustomUser,related_name="followers",on_delete=models.DO_NOTHING)
    follower = models.ForeignKey(CustomUser,related_name="followings",on_delete=models.DO_NOTHING)
    following_follower = models.CharField(max_length=350,blank = False)
    follow_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.following_follower)
