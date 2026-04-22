<script>
    import { afterNavigate, beforeNavigate } from '$app/navigation';
    import { navigating } from '$app/stores';

    let { data, children } = $props();

    // ── Libraries are loaded via static <script> tags in app.html ────────────
    const INIT_SCRIPTS = [
        '/assets/js/slider-active.js',
        '/assets/js/main.js',
        '/assets/js/tp-cursor.js',
    ];

    let _initRunning = false;

    function injectInits() {
        const ts = Date.now();
        const chain = INIT_SCRIPTS.reduce((p, s) => p.then(() => new Promise(resolve => {
            const el = document.createElement('script');
            el.src = `${s}?_=${ts}`;
            el.setAttribute('data-tp-init', 'reload');
            el.onload  = resolve;
            el.onerror = resolve;
            document.body.appendChild(el);
        })), Promise.resolve());

        return chain
            .then(() => new Promise(r => setTimeout(r, 350)))
            .then(() => new Promise(resolve => {
                const el = document.createElement('script');
                el.src = `/assets/js/hero-globe.js?_=${ts}`;
                el.setAttribute('data-tp-init', 'reload');
                el.onload  = resolve;
                el.onerror = resolve;
                document.body.appendChild(el);
            }));
    }

    function fullCleanup() {
        if (window._globeCleanup) {
            try { window._globeCleanup(); } catch(e) {}
        }
        if (window.ScrollSmoother) {
            try {
                const sm = window.ScrollSmoother.get();
                if (sm) sm.kill();
            } catch(e) {}
        }
        if (window.ScrollTrigger) {
            try {
                window.ScrollTrigger.getAll().forEach(st => { try { st.kill(); } catch(e) {} });
                window.ScrollTrigger.clearMatchMedia();
            } catch(e) {}
        }
        if (window.gsap) {
            try { window.gsap.killTweensOf('*'); } catch(e) {}
        }
        document.querySelectorAll('.swiper-container, .swiper').forEach(el => {
            if (el.swiper) { try { el.swiper.destroy(true, true); } catch(e) {} }
        });

        document.querySelectorAll('script[data-tp-init="reload"]').forEach(el => el.remove());
        
        // Force unlock body and html, and remove any lingering menu-open classes
        // document.body.style.height = ''; // Handled by tp-scroll-lock class
        // document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.body.classList.remove('tp-offcanvas-opened');
        document.querySelectorAll('.tp-offcanvas-area, .tp-offcanvas-2-area, .body-overlay').forEach(el => {
            el.classList.remove('opened');
        });

        const wrapper = document.getElementById('smooth-wrapper');
        const content = document.getElementById('smooth-content');
        if (wrapper) wrapper.removeAttribute('style');
        if (content) content.removeAttribute('style');

        document.querySelectorAll('[style*="opacity"]').forEach(el => {
            if (el._gsap) {
                el.style.opacity = '';
                el.style.transform = '';
                el.style.visibility = '';
            }
        });
    }

    /**
     * BEFORE navigation: start smooth scroll and fade-out.
     */
    beforeNavigate((nav) => {
        if (!nav.to) return;

        // 0. Close offcanvas menu if open
        const closeBtn = document.querySelector('.tp-offcanvas-2-close-btn');
        if (closeBtn) closeBtn.click();

        // 1. Lock scroll immediately
        document.body.classList.add('tp-scroll-lock');
        window.scrollTo(0, 0);

        // 2. Kill smoother so it releases control
        if (window.ScrollSmoother) {
            try {
                const sm = window.ScrollSmoother.get();
                if (sm) sm.kill();
            } catch(e) {}
        }

        if (typeof history !== 'undefined') {
            history.scrollRestoration = 'manual';
        }
    });

    /**
     * AFTER navigation: re-initialize everything.
     */
    afterNavigate(async (nav) => {
        if (_initRunning) return;
        _initRunning = true;

        try {
            const isFirstLoad = nav.from === null;

            if (!isFirstLoad) {
                fullCleanup();
                window.scrollTo(0, 0);
                await new Promise(r => setTimeout(r, 50));
            }

            if (isFirstLoad) {
                await new Promise(resolve => {
                    const check = setInterval(() => {
                        if (window.jQuery && window.Swiper && window.gsap && window.THREE) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 50);
                });
            }

            await injectInits();
            fireReadyEvents();
        } finally {
            _initRunning = false;
        }
    });

    function fireReadyEvents() {
        if (typeof window === 'undefined') return;

        window.dispatchEvent(new Event('load'));
        window.scrollTo(0, 0);
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();

        setTimeout(() => {
            if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            if (window.ScrollSmoother) {
                const sm = window.ScrollSmoother.get();
                if (sm) sm.scrollTop(0);
            }

            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.style.transition = 'opacity 0.4s ease';
                preloader.style.opacity = '0';
                setTimeout(() => { preloader.style.display = 'none'; }, 400);
            }
            
            window.dispatchEvent(new Event('resize'));
            
            // Final unlock
            document.body.classList.remove('tp-scroll-lock');
            document.body.style.height = '';
            document.body.style.overflow = '';
        }, 300);
    }
</script>

<style>
    .page-transition-wrapper {
        transition: opacity 0.35s ease-in-out;
        opacity: 1;
    }
    :global(.page-navigating) .page-transition-wrapper {
        opacity: 0;
        pointer-events: none;
    }
    /* Prevent menu doubling without blinking by hiding any duplicate ULs that the script might append */
    :global(.tp-offcanvas-menu nav ul:nth-of-type(n+2)) {
        display: none !important;
    }

    :global(body.tp-scroll-lock) {
        overflow: hidden !important;
        height: 100vh !important;
        touch-action: none;
        -ms-touch-action: none;
    }
</style>

<div class:page-navigating={$navigating}>
    <!-- Begin magic cursor -->
    <div id="magic-cursor" class="cursor-bg-yellow">
        <div id="ball"></div>
    </div>
    <!-- End magic cursor -->

    <!-- preloader -->
    <div id="preloader">
        <div class="preloader">
            <span></span>
            <span></span>
        </div>
    </div>
    <!-- preloader end  -->

    <!-- offcanvas start -->
    <div class="tp-offcanvas-2-area p-relative @@class">
        <div class="tp-offcanvas-2-bg is-left left-box"></div>
        <div class="tp-offcanvas-2-bg is-right right-box d-none d-md-block"></div>
        <div class="tp-offcanvas-2-wrapper">
            <div class="tp-offcanvas-2-left left-box">
                <div class="tp-offcanvas-2-left-wrap d-flex justify-content-between align-items-center">
                    <div class="tp-offcanvas-2-logo">
                        <a href="/">
                            <img class="logo-1" data-width="140" src="/assets/img/logo/logo-white.png" alt="">
                            <img class="logo-2" data-width="140" src="/assets/img/logo/logo-black.png" alt="">
                        </a>
                    </div>
                    <div class="tp-offcanvas-2-close d-md-none text-end">
                        <button class="tp-offcanvas-2-close-btn">
                            <span class="text"><span>close</span></span>
                            <span class="d-inline-block">
                                <span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <rect width="32.621" height="1.00918"
                                            transform="matrix(0.704882 0.709325 -0.704882 0.709325 1.0061 0)"
                                            fill="currentcolor"></rect>
                                        <rect width="32.621" height="1.00918"
                                            transform="matrix(0.704882 -0.709325 0.704882 0.709325 0 23.2842)"
                                            fill="currentcolor"></rect>
                                    </svg>
                                </span>
                            </span>
                        </button>
                    </div>
                </div>
                <div class="tp-offcanvas-menu counter-row">
                    <nav></nav>
                </div>
            </div>
            <div class="tp-offcanvas-2-right right-box d-none d-md-block p-relative">
                <div class="tp-offcanvas-2-close text-end">
                    <button class="tp-offcanvas-2-close-btn">
                        <span class="text"><span>close</span></span>
                        <span class="d-inline-block">
                            <span>
                                <svg width="38" height="38" viewBox="0 0 38 38" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.80859 9.80762L28.1934 28.1924" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M9.80859 28.1924L28.1934 9.80761" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </span>
                        </span>
                    </button>
                </div>
                <div class="tp-offcanvas-2-right-info-box mt-160">
                    <h4 class="tp-offcanvas-2-right-info-title">Get In Touch</h4>
                    <div class="tp-offcanvas-2-right-info-item">
                        <label class="mb-10">Phone</label>
                        <a class="tp-line-white" href="https://wa.me/62818410422">0818-410-422</a>
                    </div>
                    <div class="tp-offcanvas-2-right-info-item">
                        <label class="mb-10">Email</label>
                        <a class="tp-line-white" href="mailto:sv@outlook.co.id">sv@outlook.co.id</a>
                    </div>
                    <div class="tp-offcanvas-2-right-info-item">
                        <label class="mb-10">Address</label>
                        <a class="tp-line-white"
                            href="https://www.google.com.bd/maps/@23.7806365,90.4193257,12z?entry=ttu&g_ep=EgoyMDI1MDQwOS4wIKXMDSoASAFQAw%3D%3D"
                            target="_blank">
                            Jakarta, Indonesia
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- offcanvas end -->

    <!-- header area start -->
    <div class="tp-header-14-area header-transparent">
        <div class="container container-1800">
            <div class="row">
                <div class="col-xl-12">
                    <div class="tp-header-14-wrapper d-flex align-items-center justify-content-between">
                        <div class="tp-header-14-left">
                            <div class="tp-header-logo">
                                <a href="/"><img data-width="120" src="/assets/img/logo/logo-white.png"
                                        alt=""></a>
                            </div>
                        </div>
                        <div class="tp-header-14-right d-flex align-items-center">
                            <div class="tp-header-14-info d-none d-md-block">
                                <a class="tp-line-white" href="mailto:sv@outlook.co.id">sv@outlook.co.id</a>
                            </div>
                            <div class="tp-header-14-bar-wrap ml-20">
                                <button class="tp-header-8-bar tp-offcanvas-open-btn">
                                    <span>Menu</span>
                                    <span>
                                        <svg width="24" height="8" viewBox="0 0 24 8" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 0H14V1.5H0V0Z" fill="currentcolor" />
                                            <path d="M0 6H24V7.5H0V6Z" fill="currentcolor" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- header area end -->

    <nav class="tp-mobile-menu-active d-none">
        <ul>
            <li class="p-static is-active">
                <a href="/">Home</a>
            </li>
            <li class="has-dropdown p-static is-active">
                <a href="#">Projects</a>
                <ul class="tp-submenu submenu">
                    {#each data.projects as project}
                    <li><a href="/portfolio-details/{project.id}">{project.title}</a></li>
                    {/each}
                </ul>
            </li>
        </ul>
    </nav>

    <div id="smooth-wrapper">
        <div id="smooth-content">
            <div class="page-transition-wrapper">
                {@render children()}
                <footer>
                    <div class="pp-footer-area pp-footer-ptb pt-115">
                        <div class="container container-1750">
                            <div class="pp-footer-box">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="pp-footer-wrapper text-center">
                                            <span class="pp-footer-subtitle tp_fade_anim">Looking for Full-Time Opportunity</span>
                                            <h4 class="pp-footer-title tp_fade_anim not-hide-cursor" data-cursor="Whatsapp">
                                                <a class="codetext cursor-hide" href="https://wa.me/62818410422" target="_blank">0818410422</a>
                                            </h4>
                                            <div class="pp-footer-btn-box d-flex align-items-center justify-content-center">
                                                <div class="tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                                    <a class="pp-footer-btn mr-30" href="mailto:sv@outlook.co.id">sv@outlook.co.id
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M1 11L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M1 1H11V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                                <div class="tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                                    <a class="pp-footer-btn" href="/assets/img/cv/mycv.doc">Download CV
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M1 11L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M1 1H11V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pp-footer-copyright-area pp-footer-copyright-ptb">
                        <div class="container container-1430">
                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="pp-footer-copyright-wrap">
                                        <div class="pp-footer-copyright-text"><p>© 2026 all rights reserved</p></div>
                                        <div class="pp-footer-copyright-text-center"><p>Available for a full-time position</p></div>
                                        <div class="pp-footer-copyright-text"><p>Steven Christian</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    </div>
</div>
