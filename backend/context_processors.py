from django.conf import settings

def svelte_context(request):
    return {
        'SVELTE_DEV_MODE': getattr(settings, 'SVELTE_DEV_MODE', False),
        'VITE_DEV_SERVER': getattr(settings, 'VITE_DEV_SERVER', 'http://localhost:5173'),
    }
