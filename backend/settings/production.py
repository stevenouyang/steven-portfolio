import os

from .base import *

DEBUG = False

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(PROJECT_DIR)


ALLOWED_HOSTS = [
    "127.0.0.1",
    "steven.site",
    "steven.claverio.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://steven.site",
    "https://steven.claverio.com",
]

AWS_S3_ENDPOINT_URL = "http://nos.wjv-1.neo.id"

# ManifestStaticFilesStorage is recommended in production, to prevent
# outdated JavaScript / CSS assets being served from cache
# (e.g. after a Wagtail upgrade).
# See https://docs.djangoproject.com/en/5.2/ref/contrib/staticfiles/#manifeststaticfilesstorage
STORAGES["staticfiles"][
    "BACKEND"
] = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
# Use S3 for static files in production
STORAGES["staticfiles"]["BACKEND"] = "storages.backends.s3boto3.S3Boto3Storage"

try:
    from .local import *
except ImportError:
    pass
