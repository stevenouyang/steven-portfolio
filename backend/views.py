from django.http import JsonResponse, Http404
from django.shortcuts import render


def svelte_frontend(request, path=""):
    return render(request, "index.html")


# Mock data store for the example
MOCK_PROJECTS = [
    {
        "id": 1,
        "title": "Corporate Branding (Dynamic)",
        "category": "Branding",
        "year": "2025",
        "image": "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        "delay": ".3",
        "fadeFrom": "left",
        "client": "Acme Corp",
        "service": "Visual Identity",
        "description": "A complete overhaul of Acme Corp's visual identity, focusing on modern aesthetics and strong corporate presence. We designed everything from logos to marketing materials.",
        "about_desc": "Our approach to Acme Corp's branding was deeply rooted in their core values of trust and innovation. We conducted extensive market research to ensure the new identity resonated with their target audience while standing out in a crowded market.",
        "about_list": ["Brand Strategy", "Visual Identity", "Marketing Collateral"],
        "overview_desc": "The project involved a comprehensive audit of existing brand materials, followed by the development of a new logo, color palette, typography, and comprehensive brand guidelines.",
        "site_url": "https://example.com/acme",
        "images": [
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        ],
    },
    {
        "id": 2,
        "title": "AI in Healthcare (Dynamic)",
        "category": "Technology",
        "year": "2025",
        "image": "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        "delay": ".5",
        "fadeFrom": "right",
        "client": "MediTech Solutions",
        "service": "UI/UX Design",
        "description": "Designing an intuitive interface for a cutting-edge AI healthcare application. The focus was on clarity, accessibility, and trustworthy design.",
        "about_desc": "MediTech Solutions approached us to design the user interface for their new AI-powered diagnostic tool. The challenge was to make complex medical data easily understandable for both doctors and patients.",
        "about_list": ["User Research", "Wireframing", "Prototyping", "UI Design"],
        "overview_desc": "We created a clean, intuitive interface that prioritizes critical information. The design language emphasizes trust and professionalism, utilizing a calming color palette and clear typography.",
        "site_url": "https://example.com/meditech",
        "images": [
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        ],
    },
    {
        "id": 3,
        "title": "Urban Green Spaces (Dynamic)",
        "category": "Architecture",
        "year": "2025",
        "image": "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        "delay": ".3",
        "fadeFrom": "left",
        "client": "City Council",
        "service": "3D Visualization",
        "description": "Creating breathtaking 3D visualizations for proposed urban green spaces, helping the city council secure funding and public approval.",
        "about_desc": "The City Council needed compelling visuals to present their vision for new urban parks. Our goal was to create realistic and inspiring 3D renderings that would capture the public's imagination.",
        "about_list": ["3D Modeling", "Rendering", "Environment Design"],
        "overview_desc": "We developed highly detailed 3D models of the proposed parks, incorporating realistic lighting, vegetation, and human activity to bring the spaces to life.",
        "site_url": "https://example.com/urban-green",
        "images": [
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        ],
    },
    {
        "id": 4,
        "title": "Logistics Made Simple (Dynamic)",
        "category": "Web Development",
        "year": "2025",
        "image": "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        "delay": ".5",
        "fadeFrom": "right",
        "client": "FastFreight",
        "service": "Full-Stack Development",
        "description": "Developing a robust, scalable web platform for a leading logistics company. The platform features real-time tracking and a comprehensive admin dashboard.",
        "about_desc": "FastFreight required a modern web platform to streamline their logistics operations. We built a custom solution that handles everything from order management to real-time driver tracking.",
        "about_list": [
            "Frontend Development",
            "Backend Architecture",
            "API Integration",
            "Database Design",
        ],
        "overview_desc": "The new platform significantly improved FastFreight's operational efficiency. We utilized a modern tech stack to ensure high performance, security, and scalability.",
        "site_url": "https://example.com/fastfreight",
        "images": [
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        ],
    },
    {
        "id": 5,
        "title": "New Dynamic Project",
        "category": "Testing",
        "year": "2026",
        "image": "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        "delay": ".3",
        "fadeFrom": "left",
        "client": "Test Client",
        "service": "Testing Service",
        "description": "This project proves the backend is wired!",
        "about_desc": "This project proves the backend is wired!",
        "about_list": ["Proof", "Wiring", "Dynamic"],
        "overview_desc": "This project proves the backend is wired!",
        "site_url": "https://example.com/test",
        "images": [
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
            "http://nos.wjv-1.neo.id/cors/CACHE/images/portfolio/main/Indopesona.id_-_Customer_Interface_2/c77c75a940ea63235b2943615f4cd3bb.webp",
        ],
    },
]


def api_projects(request):
    """
    JSON API endpoint returning a list of projects.
    """
    # Return a simplified list for the index page to save bandwidth
    list_data = []
    for p in MOCK_PROJECTS:
        list_data.append(
            {
                "id": p["id"],
                "title": p["title"],
                "category": p["category"],
                "year": p["year"],
                "image": p["image"],
                "delay": p["delay"],
                "fadeFrom": p["fadeFrom"],
            }
        )
    return JsonResponse({"projects": list_data})


def api_project_detail(request, project_id):
    """
    JSON API endpoint returning detailed data for a specific project.
    """
    for p in MOCK_PROJECTS:
        if p["id"] == project_id:
            return JsonResponse({"project": p})

    raise Http404("Project not found")
