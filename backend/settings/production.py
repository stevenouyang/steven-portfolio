import os

from .base import *

DEBUG = False
SVELTE_DEV_MODE = False

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(PROJECT_DIR)


ALLOWED_HOSTS = [
    "127.0.0.1",
    "steven.site",
    "steven.claverio.com",
    "www.steven.claverio.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://steven.site",
    "https://steven.claverio.com",
    "https://www.steven.claverio.com",
]

AWS_S3_ENDPOINT_URL = "http://nos.wjv-1.neo.id"

# Proxy settings for production (helps with 400 Bad Request)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True


# ManifestStaticFilesStorage is recommended in production, to prevent
# outdated JavaScript / CSS assets being served from cache
# (e.g. after a Wagtail upgrade).
# See https://docs.djangoproject.com/en/5.2/ref/contrib/staticfiles/#manifeststaticfilesstorage
STORAGES["staticfiles"][
    "BACKEND"
] = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
# Use S3 for static files in production with public-read permissions
STORAGES["staticfiles"] = {
    "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    "OPTIONS": {
        "default_acl": "public-read",
        "querystring_auth": False,
    },
}

# Construct the S3 URL for static files (forcing https as requested)
STATIC_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/".replace("http://", "https://")

# Logging configuration for production to see errors in 'docker logs'
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}


try:
    from .local import *
except ImportError:
    pass
