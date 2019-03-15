import re

from django.core.validators import RegexValidator
from django.utils.deconstruct import deconstructible

@deconstructible
class WowtagIdValidator(RegexValidator):
    regex = r'^[\w.!+-]+$'
    message = "Enter a valid wowtagid."
    flags = re.ASCII

@deconstructible
class PhoneNumberValidator(RegexValidator):
    regex = r'^\+?1?\d{9,15}$'
    message = "You have provided an invalid Phone number."
    flags = 0