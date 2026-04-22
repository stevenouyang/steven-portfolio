<script>
    let { data } = $props();

    function getImgSrc(src) {
        if (!src) return "";
        if (src.startsWith('http')) return src;
        if (src.startsWith('/')) return src;
        return `/${src}`;
    }
</script>

<main>

                <!-- hero area start -->
                <div id="globe-scroll-container">
                    <div class="pp-hero-area pp-hero-hight pp-hero-ptb z-index-1 d-flex align-items-end globe-hero"
                        data-bg-color="#000000">

                        <!-- Layer 1: Space Background -->
                        <canvas id="space-bg"></canvas>

                        <!-- Layer 2: Three.js Globe -->
                        <canvas id="globe-canvas"></canvas>

                        <!-- Hero Content Layer (existing content) -->
                        <div class="pp-hero-content-layer">
                            <div class="container container-1800">
                                <div class="row align-items-end">
                                    <div class="col-xl-9 col-lg-8 col-md-6">
                                        <div class="pp-hero-left z-index-1 pb-100">
                                            <h2 class="tp-text-revel-anim" data-ease="bounce"
                                                style="color: #f4de64; font-size: clamp(35px, 4vw, 65px); font-weight: 800; line-height: 1; margin-bottom: 15px; letter-spacing: 2px;">
                                                STEVEN C</h2>
                                            <span class="pp-hero-text tp-split-text tp-split-right">Problem Solver
                                                <br>Full Stack Dev<br>AI Engineer</span>
                                        </div>
                                    </div>
                                    <div class="col-xl-3 col-lg-4 col-md-6">
                                        <div class="pp-hero-right z-index-2 pb-100">
                                            <div class="tp_text_anim">
                                                <p>
                                                    I'm dedicated to develop any type <br>
                                                    of software at a pace most people <br>
                                                    aren't build for
                                                </p>
                                            </div>
                                            <div class="pp-hero-btn">
                                                <div class="tp-btn-red-circle-box tp-pp-btn-style tp_fade_anim"
                                                    data-delay=".7" data-fade-from="top" data-ease="bounce">
                                                    <a class="tp-btn-red-circle-icon" href="https://wa.me/62818410422"
                                                        target="_blank">
                                                        <span>
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                                xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M1 11L11 1M11 1H1M11 1V11"
                                                                    stroke="currentcolor" stroke-width="1.5"
                                                                    stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </span>
                                                    </a>
                                                    <a class="tp-btn-red-circle-text" href="https://wa.me/62818410422"
                                                        target="_blank">Contact Me</a>
                                                    <a class="tp-btn-red-circle-icon" href="https://wa.me/62818410422"
                                                        target="_blank">
                                                        <span>
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                                xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M1 11L11 1M11 1H1M11 1V11"
                                                                    stroke="currentcolor" stroke-width="1.5"
                                                                    stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- The massive 'STEVEN C' heading has been removed -->
                            </div>

                            <!-- Scroll hint -->
                            <div class="globe-scroll-hint">
                                <span>Scroll</span>
                                <div class="scroll-line"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- hero area end -->


                <!-- brand area start -->
                <div class="pp-brand-area ar-brand-style">
                    <div class="tp-brand-wrapper z-index-1">
                        <div class="swiper-container tp-brand-active">
                            <div class="swiper-wrapper slide-transtion">
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title"><i>9 /</i>Years Of Experience</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title"><i>20+ /</i> Projects Finished</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title"><i> 5+ /</i>Python Package</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- brand area end -->


                <!-- about area start -->
                <div class="pp-about-area pp-about-ptb p-relative pt-160 pb-160">
                    <div class="pp-about-shape">
                        <img data-speed=".8" src="/assets/img/home-14/about/about-shape.png" alt="">
                    </div>
                    <div class="container container-1430">
                        <div class="row">
                            <div class="col-lg-3">
                                <div class="pp-about-left">
                                    <span class="tp-section-subtitle-clash clash-subtitle-pos body-ff">
                                        About Me
                                        <i>
                                            <svg width="102" height="9" viewBox="0 0 102 9" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M98 8L101.5 4.5L98 1M1 4H101V5H1V4Z" stroke="currentcolor"
                                                    stroke-linecap="round" stroke-linejoin="round"></path>
                                            </svg>
                                        </i>
                                    </span>
                                </div>
                            </div>
                            <div class="col-lg-9">
                                <div class="pp-about-heading pb-55">
                                    <h3 class="tp-section-title-teko fs-80 tp_fade_anim">
                                        I’m a <span style="color: #FFF669">T Shaped</span> Software Developer <br>
                                        with strong problem solving skill.<br>
                                        My focus is to turn technical decision<br>
                                        into measurable business outcome.
                                    </h3>
                                </div>
                                <div class="pp-about-wrap">
                                    <div class="pp-about-bottom-btn smooth">
                                        <a href="#down"><span><svg xmlns="http://www.w3.org/2000/svg" width="10"
                                                    height="21" viewBox="0 0 10 21" fill="none">
                                                    <path
                                                        d="M4.57574 20.4243C4.81005 20.6586 5.18995 20.6586 5.42426 20.4243L9.24264 16.6059C9.47696 16.3716 9.47696 15.9917 9.24264 15.7574C9.00833 15.523 8.62843 15.523 8.39411 15.7574L5 19.1515L1.60589 15.7574C1.37157 15.523 0.991674 15.523 0.757359 15.7574C0.523045 15.9917 0.523045 16.3716 0.757359 16.6059L4.57574 20.4243ZM4.4 0L4.4 20H5.6L5.6 0L4.4 0Z"
                                                        fill="white" />
                                                </svg></span></a>
                                    </div>
                                    <div class="pp-about-content tp_text_anim">
                                        <p>
                                            Stack-agnostic engineer<br>
                                            and fast learner, who enjoys<br>
                                            breaking down complex systems<br>
                                            and building clean, maintainable<br>
                                            solutions.
                                        </p>
                                        <div class="pp-about-btn">
                                            <div class="tp-btn-red-circle-box tp-pp-btn-style tp_fade_anim"
                                                data-delay=".7" data-fade-from="top" data-ease="bounce">
                                                <a class="tp-btn-red-circle-icon" target="_blank"
                                                    href="https://wa.me/62818410422">
                                                    <span>
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentcolor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round" />
                                                        </svg>
                                                    </span>
                                                </a>
                                                <a class="tp-btn-red-circle-text" href="https://wa.me/62818410422"
                                                    target="_blank">Contact
                                                    Me</a>
                                                <a class="tp-btn-red-circle-icon" href="https://wa.me/62818410422"
                                                    target="_blank">
                                                    <span>
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentcolor"
                                                                stroke-width="1.5" stroke-linecap="round"
                                                                stroke-linejoin="round" />
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
                <!-- about area end -->


                <!-- service area start -->
                <div class="pp-service-area pp-service-ptb p-relative pb-160">
                    <div class="pp-service-shape">
                        <img data-speed="1.1" src="/assets/img/home-14/about/about-shape-2.png" alt="">
                    </div>
                    <div class="container container-1430">
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="pp-service-heading z-index-2">
                                    <span>What i Do</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="container-fluid gx-0">
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="pp-service-wrapper z-index-1">
                                    <a href="service-1-dark.html" class="pp-service-item z-index-1">
                                        <span class="pp-service-item-title">Platform Dev</span>
                                    </a>
                                    <a href="service-1-dark.html" class="pp-service-item z-index-1">
                                        <span class="pp-service-item-title">Backend Dev</span>
                                    </a>
                                    <a href="service-1-dark.html" class="pp-service-item z-index-1">
                                        <span class="pp-service-item-title">Frontend Dev</span>
                                    </a>
                                    <a href="service-1-dark.html" class="pp-service-item current z-index-1">
                                        <span class="pp-service-item-title">AI PIPELINE Dev</span>
                                    </a>
                                    <a href="service-1-dark.html" class="pp-service-item z-index-1">
                                        <span class="pp-service-item-title">Graphic Design</span>
                                    </a>
                                    <a href="service-1-dark.html" class="pp-service-item z-index-1">
                                        <span class="pp-service-item-title">Digital Marketing</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- service area end -->


                <!-- banner area start -->
                <div class="pp-banner-area pp-banner-style">
                    <div class="pp-banner-wrap">
                        <img class="w-100" data-speed=".8" src="/assets/img/home-14/banner/pp-banner-thumb.jpg" alt="">
                    </div>
                </div>
                <!-- banner area end -->


                <!-- project area start -->
                <div id="down" class="pp-project-area pp-project-ptb z-index-1 pt-160 pb-100">
                    <div class="container container-1430">
                        <div class="row">
                            <div class="col-xxl-3 col-xl-12 col-md-4">
                                <div class="pp-project-sub-heading mb-70 tp_fade_anim" data-delay=".3">
                                    <span class="tp-section-subtitle-clash clash-subtitle-pos body-ff">
                                        Work Showcase
                                        <i>
                                            <svg width="102" height="9" viewBox="0 0 102 9" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M98 8L101.5 4.5L98 1M1 4H101V5H1V4Z" stroke="currentcolor"
                                                    stroke-linecap="round" stroke-linejoin="round"></path>
                                            </svg>
                                        </i>
                                    </span>
                                </div>
                            </div>
                            <div class="col-xxl-6 col-xl-6 col-md-8">
                                <div class="pp-project-heading mb-70 tp_fade_anim" data-delay=".5">
                                    <h3 class="tp-section-title-teko fs-120">Discover my <br>Recent Project (Django Wired)</h3>
                                </div>
                            </div>
                            <div class="col-xxl-3 col-xl-6 col-md-6">
                                <div class="pp-project-btn pb-90">
                                    <div class="tp-btn-red-circle-box tp-pp-btn-style tp_fade_anim" data-delay=".5"
                                        data-fade-from="top" data-ease="bounce">
                                        <a class="tp-btn-red-circle-icon" href="portfolio-masonry.html">
                                            <span>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentcolor"
                                                        stroke-width="1.5" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </span>
                                        </a>
                                        <a class="tp-btn-red-circle-text" href="portfolio-masonry.html">View all
                                            Projects</a>
                                        <a class="tp-btn-red-circle-icon" href="portfolio-masonry.html">
                                            <span>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentcolor"
                                                        stroke-width="1.5" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row gx-40">
                            {#each data.projects as project}
                            <div class="col-lg-6 tp_fade_anim" data-delay={project.delay} data-fade-from={project.fadeFrom}>
                                <div class="pp-project-item tp--hover-item mb-65">
                                    <div class="pp-project-item-thumb not-hide-cursor" data-cursor="View<br>Demo">
                                        <a class="cursor-hide" href="/portfolio-details/{project.id}">
                                            <img src={getImgSrc(project.image)} alt="">
                                        </a>
                                    </div>
                                    <div class="pp-project-item-contenet">
                                        <h4 class="pp-project-item-title"><a href="/portfolio-details/{project.id}">{project.title}</a></h4>
                                        <span class="pp-project-item-meta">{project.category} - {project.year}</span>
                                    </div>
                                </div>
                            </div>
                            {/each}
                        </div>

                    </div>
                </div>
                <!-- project area end -->


                <!-- text slider area start -->
                <div class="pp-text-slider-area ar-brand-style">
                    <div class="tp-brand-wrapper z-index-1">
                        <div class="swiper-container tp-brand-active">
                            <div class="swiper-wrapper slide-transtion">
                                <div class="swiper-slide">
                                    <div class="pp-text-slider-item">
                                        <span class="pp-text-slider-title">OPEN FOR LONG-TERM FULLTIME JOB</span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-text-slider-item">
                                        <span class="pp-text-slider-title">OPEN FOR LONG-TERM FULLTIME JOB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- text slider area end -->


                <!-- skill area start -->
                <div class="pp-skill-area pp-skill-ptb pb-150" data-bg-color="#FFF669">
                    <div class="conteiner-fluid">
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="pp-skill-big-text text-center">
                                    <h2 class="pp-skill-big-text-title tp-split-text tp-split-right">Tools & Skills</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="container container-1230">
                        <div class="pp-skill-list-wrapper pb-60">
                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="pp-skill-heading d-flex align-items-center mb-50">
                                        <span class="pp-skill-subtitle">About</span>
                                        <img src="/assets/img/home-14/slider/pp-line.png" alt="">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="pp-skill-heading">
                                        <h3 class="pp-skill-title">Tools <br>& Skills </h3>
                                    </div>
                                </div>
                                <div class="col-lg-8">
                                    <div class="pp-skill-list-wrap">
                                        <div class="row">
                                            <div class="col-sm-6 tp_fade_anim" data-delay=".3">
                                                <div class="pp-skill-list mb-60">
                                                    <h4 class="pp-skill-list-title">Web Development</h4>
                                                    <ul>
                                                        <li>Python</li>
                                                        <li>Django</li>
                                                        <li>FastAPI</li>
                                                        <li>HTML & CSS</li>
                                                        <li>JavaScript</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="col-sm-6 tp_fade_anim" data-delay=".3">
                                                <div class="pp-skill-list mb-60">
                                                    <h4 class="pp-skill-list-title">Deployment</h4>
                                                    <ul>
                                                        <li>Linux</li>
                                                        <li>Docker</li>
                                                        <li>Amazon S3</li>
                                                        <li>PostgreSQL</li>
                                                        <li>Grafana & Prometheus</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="col-sm-6 tp_fade_anim" data-delay=".5">
                                                <div class="pp-skill-list mb-60">
                                                    <h4 class="pp-skill-list-title">AI & Data</h4>
                                                    <ul>
                                                        <li>PyTorch</li>
                                                        <li>Scikit-Learn</li>
                                                        <li>Onnx & RAG</li>
                                                        <li>LLM Utilizing</li>
                                                        <li>Pandas & Numpy</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="col-sm-6 tp_fade_anim" data-delay=".5">
                                                <div class="pp-skill-list mb-60">
                                                    <h4 class="pp-skill-list-title">Others</h4>
                                                    <ul>
                                                        <li>Swift</li>
                                                        <li>Flutter</li>
                                                        <li>RestAPI</li>
                                                        <li>Photoshop</li>
                                                        <li>Final Cut Pro</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="pp-skill-tools">
                            <div class="row gx-0 justify-content-center">
                                <div class="col-xl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".3"
                                    data-fade-from="top" data-ease="bounce">
                                    <div class="pp-skill-tools-item text-center">
                                        <div class="pp-skill-tools-item-icon">
                                            <img src="/assets/img/home-14/skill/skill-icon-1.png" alt="">
                                        </div>
                                        <h4 class="pp-skill-tools-item-title">Backend</h4>
                                        <span class="pp-skill-tools-item-persent">90%</span>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".5"
                                    data-fade-from="top" data-ease="bounce">
                                    <div class="pp-skill-tools-item text-center">
                                        <div class="pp-skill-tools-item-icon">
                                            <img src="/assets/img/home-14/skill/skill-icon-2.png" alt="">
                                        </div>
                                        <h4 class="pp-skill-tools-item-title">Front End</h4>
                                        <span class="pp-skill-tools-item-persent">60%</span>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".7"
                                    data-fade-from="top" data-ease="bounce">
                                    <div class="pp-skill-tools-item text-center">
                                        <div class="pp-skill-tools-item-icon">
                                            <img src="/assets/img/home-14/skill/skill-icon-3.png" alt="">
                                        </div>
                                        <h4 class="pp-skill-tools-item-title">Graphic Design</h4>
                                        <span class="pp-skill-tools-item-persent">70%</span>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-4 col-md-6 tp_fade_anim" data-delay=".9"
                                    data-fade-from="top" data-ease="bounce">
                                    <div class="pp-skill-tools-item text-center">
                                        <div class="pp-skill-tools-item-icon">
                                            <img src="/assets/img/home-14/skill/skill-icon-4.png" alt="">
                                        </div>
                                        <h4 class="pp-skill-tools-item-title">Digital Marketing</h4>
                                        <span class="pp-skill-tools-item-persent">80%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- skill area end -->


                <!-- brand area start -->
                <div class="pp-brand-area ar-brand-style">
                    <div class="tp-brand-wrapper z-index-1">
                        <div class="swiper-container tp-brand-active">
                            <div class="swiper-wrapper slide-transtion">
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title">Enterprise System</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title">Landing page</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title">Chatbot</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title">Bot & Automation</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title">Mobile App</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                                <div class="swiper-slide">
                                    <div class="pp-brand-item">
                                        <span class="pp-brand-title">Digital Platform</span>
                                        <span class="pp-brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="31"
                                                height="30" viewBox="0 0 31 30" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M16.384 0H14.2411V12.4133L5.46352 3.63578L3.94829 5.15102L12.7258 13.9286H0.3125V16.0715H12.7258L3.94829 24.849L5.46352 26.3642L14.2411 17.5866V30H16.384V17.5866L25.1615 26.3642L26.6767 24.849L17.8991 16.0715H30.3125V13.9286H17.8991L26.6767 5.151L25.1615 3.63578L16.384 12.4133V0Z"
                                                    fill="#FFF669" />
                                            </svg></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- brand area end -->


                <!-- award area start -->
                <div class="pp-award-area pp-award-ptb pt-160 pb-160">
                    <div class="container container-1430">
                        <div class="row">
                            <div class="col-lg-2">
                                <div class="pp-award-left tp_fade_anim" data-delay=".3">
                                    <span class="tp-section-subtitle-clash clash-subtitle-pos body-ff">
                                        Award
                                        <i>
                                            <svg width="102" height="9" viewBox="0 0 102 9" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M98 8L101.5 4.5L98 1M1 4H101V5H1V4Z" stroke="currentcolor"
                                                    stroke-linecap="round" stroke-linejoin="round"></path>
                                            </svg>
                                        </i>
                                    </span>
                                </div>
                            </div>
                            <div class="col-lg-10">
                                <div class="pp-about-heading pb-55">
                                    <h3 class="tp-section-title-teko fs-120 tp_fade_anim" data-delay=".5">Awards & <br>
                                        Recognitions</h3>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="pp-award-wrapper">
                                    <div class="tp-award-item-wrap p-relative">
                                        <div class="tp-award-item pp-award-header p-relative mb-5 tp_fade_anim">
                                            <div class="row align-items-center">
                                                <div class="col-lg-8 col-md-6">
                                                    <div class="tp-award-box-left z-index-3">
                                                        <span class="tp-award-year tp-award-text-2">year</span>
                                                        <span class="tp-award-text tp-award-text-2">Recognition</span>
                                                        <span class="tp-award-text-2">Department</span>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4 col-md-6">
                                                    <div
                                                        class="tp-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                                        <span class="tp-award-text-2">Issuer</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="tp-award-item hover-reveal-item p-relative tp_fade_anim">
                                            <div class="row align-items-center">
                                                <div class="col-lg-8 col-md-6">
                                                    <div class="tp-award-box-left z-index-3">
                                                        <span class="tp-award-year">2017</span>
                                                        <span class="tp-award-text">TOP Performer</span>
                                                        <span class="tp-award-year">Marketing Dept</span>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4 col-md-6">
                                                    <div
                                                        class="tp-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                                        <span class="tp-award-position">ANZ Bank</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tp-award-reveal-img"
                                                data-background="/assets/img/home-01/award/award-1.jpg"></div>
                                        </div>
                                        <div class="tp-award-item hover-reveal-item p-relative tp_fade_anim">
                                            <div class="row align-items-center">
                                                <div class="col-lg-8 col-md-6">
                                                    <div class="tp-award-box-left z-index-3">
                                                        <span class="tp-award-year">2016</span>
                                                        <span class="tp-award-text">Employee of the Year</span>
                                                        <span class="tp-award-year">Marketing Dept</span>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4 col-md-6">
                                                    <div
                                                        class="tp-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                                        <span class="tp-award-position">Megakamera</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tp-award-reveal-img"
                                                data-background="/assets/img/home-01/award/award-1.jpg"></div>
                                        </div>
                                        <div class="tp-award-item hover-reveal-item p-relative tp_fade_anim">
                                            <div class="row align-items-center">
                                                <div class="col-lg-8 col-md-6">
                                                    <div class="tp-award-box-left z-index-3">
                                                        <span class="tp-award-year">2015</span>
                                                        <span class="tp-award-text">Participant</span>
                                                        <span class="tp-award-year">OSN (National)</span>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4 col-md-6">
                                                    <div
                                                        class="tp-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                                        <span class="tp-award-position">Education Authorities</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tp-award-reveal-img"
                                                data-background="/assets/img/home-01/award/award-1.jpg"></div>
                                        </div>
                                        <div class="tp-award-item hover-reveal-item p-relative tp_fade_anim">
                                            <div class="row align-items-center">
                                                <div class="col-lg-8 col-md-6">
                                                    <div class="tp-award-box-left z-index-3">
                                                        <span class="tp-award-year">2015</span>
                                                        <span class="tp-award-text">Participant</span>
                                                        <span class="tp-award-year">FLS2N (Province)</span>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4 col-md-6">
                                                    <div
                                                        class="tp-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                                        <span class="tp-award-position">Education Authorities</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tp-award-reveal-img"
                                                data-background="/assets/img/home-01/award/award-1.jpg"></div>
                                        </div>
                                        <div class="tp-award-item hover-reveal-item p-relative tp_fade_anim">
                                            <div class="row align-items-center">
                                                <div class="col-lg-8 col-md-6">
                                                    <div class="tp-award-box-left z-index-3">
                                                        <span class="tp-award-year">2014</span>
                                                        <span class="tp-award-text">Participant</span>
                                                        <span class="tp-award-year">OSN (City)</span>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4 col-md-6">
                                                    <div
                                                        class="tp-award-box-right z-index-3 d-flex justify-content-between align-items-center">
                                                        <span class="tp-award-position">Education Authorities</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tp-award-reveal-img"
                                                data-background="/assets/img/home-01/award/award-1.jpg"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- award area end -->


                <!-- social area start -->
                <div class="pp-social-area pp-social-ptb pb-100">
                    <div class="container-fluid gx-0">
                        <div class="row gx-0">
                            <div class="col-lg-12">
                                <div class="pp-social-wrapper p-relative fix pt-20">
                                    <a href="#" class="pp-social-item img-pos-1">
                                        <div class="pp-social-item-wrap p-relative">
                                            <h3 class="pp-social-item-title">Instagram</h3>
                                            <p class="text-right">Music Production <br>
                                                Shorts inspiration</p>
                                        </div>
                                        <div class="pp-social-item-thumb">
                                            <img src="/assets/img/home-14/social/social-thumb-1.jpg" alt=""
                                                class="thumb-1">
                                            <img src="/assets/img/home-14/social/social-thumb-4.jpg" alt=""
                                                class="thumb-2">
                                            <img src="/assets/img/home-14/social/social-thumb-2.jpg" alt=""
                                                class="thumb-3">
                                            <img src="/assets/img/home-14/social/social-thumb-3.jpg" alt=""
                                                class="thumb-4">
                                        </div>
                                    </a>
                                    <a href="#" class="pp-social-item img-pos-2 active">
                                        <div class="pp-social-item-wrap p-relative">
                                            <p class="text-left">Projects case <br>
                                                Studies</p>
                                            <h3 class="pp-social-item-title">LinkedIn</h3>
                                        </div>
                                        <div class="pp-social-item-thumb">
                                            <img src="/assets/img/home-14/social/social-thumb-6.jpg" alt=""
                                                class="thumb-1">
                                            <img src="/assets/img/home-14/social/social-thumb-5.jpg" alt=""
                                                class="thumb-2">
                                            <img src="/assets/img/home-14/social/social-thumb-7.png" alt=""
                                                class="thumb-3">
                                            <img src="/assets/img/home-14/social/social-thumb-10.jpg" alt=""
                                                class="thumb-4">
                                        </div>
                                    </a>
                                    <a href="#" class="pp-social-item img-pos-3">
                                        <div class="pp-social-item-wrap p-relative">
                                            <h3 class="pp-social-item-title">Youtube</h3>
                                            <p class="text-right">Content Creation <br>
                                                experimental</p>
                                        </div>
                                        <div class="pp-social-item-thumb">
                                            <img src="/assets/img/home-14/social/social-thumb-17.jpg" alt=""
                                                class="thumb-1">
                                            <img src="/assets/img/home-14/social/social-thumb-13.jpg" alt=""
                                                class="thumb-2">
                                            <img src="/assets/img/home-14/social/social-thumb-11.jpg" alt=""
                                                class="thumb-3">
                                            <img src="/assets/img/home-14/social/social-thumb-8.png" alt=""
                                                class="thumb-4">
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- social area end -->

            </main>