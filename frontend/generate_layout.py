import re

with open('/Users/stevenchristian/Desktop/agntix/index-personal-portfolio-dark.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract from magic cursor to header end
top_part = html[html.find('<!-- Begin magic cursor -->'):html.find('<div id="smooth-wrapper">')]

# Extract footer
footer_part = html[html.find('<footer>'):html.find('</footer>') + 9]

scripts = [
    "/assets/js/vendor/jquery.js",
    "/assets/js/bootstrap-bundle.js",
    "/assets/js/swiper-bundle.js",
    "/assets/js/plugin.js",
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/108/three.min.js",
    "/assets/js/slick.js",
    "/assets/js/scroll-magic.js",
    "/assets/js/hover-effect.umd.js",
    "/assets/js/magnific-popup.js",
    "/assets/js/parallax-slider.js",
    "/assets/js/nice-select.js",
    "/assets/js/purecounter.js",
    "/assets/js/isotope-pkgd.js",
    "/assets/js/imagesloaded-pkgd.js",
    "/assets/js/ajax-form.js",
    "/assets/js/Observer.min.js",
    "/assets/js/splitting.min.js",
    "/assets/js/webgl.js",
    "/assets/js/parallax-scroll.js",
    "/assets/js/atropos.js",
    "/assets/js/slider-active.js",
    "/assets/js/main.js",
    "/assets/js/tp-cursor.js",
    "/assets/js/portfolio-slider-1.js",
    {"src": "/assets/js/distortion-img.js", "type": "module"},
    {"src": "/assets/js/skew-slider/index.js", "type": "module"},
    {"src": "/assets/js/img-revel/index.js", "type": "module"},
    "/assets/js/hero-globe.js"
]

script_js = """<script>
    import { onMount } from 'svelte';
    
    onMount(() => {
        const scripts = [
"""
for s in scripts:
    if isinstance(s, dict):
        script_js += f"            {{ src: '{s['src']}', type: '{s['type']}' }},\n"
    else:
        script_js += f"            '{s}',\n"
        
script_js += """        ];
        
        const loadScripts = async () => {
            for (let s of scripts) {
                await new Promise((resolve, reject) => {
                    const el = document.createElement('script');
                    if (typeof s === 'string') {
                        el.src = s;
                    } else {
                        el.src = s.src;
                        el.type = s.type;
                    }
                    el.onload = resolve;
                    el.onerror = resolve; // Continue on error
                    document.body.appendChild(el);
                });
            }
        };
        
        loadScripts();
    });
</script>
"""

layout_svelte = f"""{script_js}

{top_part}

<div id="smooth-wrapper">
    <div id="smooth-content">

        <slot />

        {footer_part}

    </div>
</div>
"""

with open('/Users/stevenchristian/Desktop/agntix/steven/steven/src/routes/+layout.svelte', 'w', encoding='utf-8') as f:
    f.write(layout_svelte)

