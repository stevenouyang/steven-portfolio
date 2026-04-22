import os
from django.conf import settings
from django.urls import include, path, re_path
from django.views.static import serve
from django.contrib import admin

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from search import views as search_views
from backend import views

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("search/", search_views.search, name="search"),
    
    # API endpoints
    path("api/projects/", views.api_projects, name="api_projects"),
    path("api/projects/<int:project_id>/", views.api_project_detail, name="api_project_detail"),
    
    # SvelteKit catch-all frontend route
    path("", views.svelte_frontend, name="svelte_frontend_root"),
    
    # Redirect Svelte static assets to S3
    re_path(r'^_app/(?P<path>.*)$', views.svelte_static_redirect),
    re_path(r'^assets/(?P<path>.*)$', views.svelte_static_redirect),

    re_path(r'^(?!api/|admin/|django-admin/|documents/|search/|static/|_app/|assets/).*$', views.svelte_frontend, name="svelte_frontend"),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = urlpatterns + [
    # For anything not caught by a more specific rule above, hand over to
    # Wagtail's page serving mechanism. This should be the last pattern in
    # the list:
    path("", include(wagtail_urls)),
    # Alternatively, if you want Wagtail pages to be served from a subpath
    # of your site, rather than the site root:
    #    path("pages/", include(wagtail_urls)),
]
