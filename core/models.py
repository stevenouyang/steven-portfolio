from django.db import models

# Wagtail imports
from modelcluster.models import ClusterableModel
from modelcluster.fields import ParentalKey

# imagekit imports
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill, ResizeToFit, Adjust

from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.snippets.models import register_snippet


@register_snippet
class Project(ClusterableModel):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    year = models.CharField(max_length=4)
    image = models.ImageField(upload_to="project_images/")
    client = models.CharField(max_length=100)
    service = models.CharField(max_length=100)
    description = models.TextField()
    about_desc = models.TextField()
    overview_desc = models.TextField()
    site_url = models.URLField()
    image_1 = models.ImageField(upload_to="project_images/")
    image_2 = models.ImageField(upload_to="project_images/")

    panels = [
        FieldPanel("title"),
        FieldPanel("category"),
        FieldPanel("year"),
        FieldPanel("image"),
        FieldPanel("client"),
        FieldPanel("service"),
        FieldPanel("description"),
        FieldPanel("about_desc"),
        FieldPanel("overview_desc"),
        FieldPanel("site_url"),
        FieldPanel("image_1"),
        FieldPanel("image_2"),
        InlinePanel("about_lists", label="About List Items"),
    ]


class ProjectAboutList(models.Model):
    project = ParentalKey(Project, on_delete=models.CASCADE, related_name="about_lists")
    item = models.CharField(max_length=100)
