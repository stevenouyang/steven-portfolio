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

    <!-- portfolio details area start -->
    <div class="tp-portfolio-details-1-area pt-110 pb-140">
        <div class="container container-1830">
            <div class="row">
                <div class="col-lg-12">
                    <div class="tp-portfolio-details-1-banner">
                        <img data-speed=".8"
                            src={getImgSrc(data.project.images[0])}
                            alt="">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- portfolio details area end -->


    <!-- portfolio details area start -->
    <div class="tp-portfolio-details-1-ptb pb-100">
        <div class="container container-1430">
            <div class="row">
                <div class="col-lg-6">
                    <div class="tp-portfolio-details-1-heading">
                        <span class="tp-portfolio-details-1-sub tp_fade_anim" data-delay=".3">{data.project.category}</span>
                        <h3 class="tp-portfolio-details-1-title tp_fade_anim" data-delay=".5">
                            {data.project.title}
                        </h3>
                        <div class="tp-portfolio-details-1-btn tp_fade_anim" data-delay=".7">
                            <a class="tp-portfolio-details-btn" href="{data.project.site_url}" target="_blank">Visit Site <span><svg
                                        xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                                        viewBox="0 0 10 10" fill="none">
                                        <path d="M1 9L9 1M9 1H1M9 1V9" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg></span></a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="tp-portfolio-details-1-content">
                        <p>{data.project.description}</p>
                        <div class="tp-portfolio-details-1-list">
                            <ul>
                                <li><span>Client :</span> {data.project.client}</li>
                                <li><span>Date :</span> {data.project.year}</li>
                                <li><span>Role :</span> {data.project.service}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- portfolio details area end -->


    <!-- portfolio details thumb area start -->
    <div class="tp-portfolio-details-1-thumb-ptb pb-140">
        <div class="container container-1830">
            <div class="row gx-20">
                <div class="col-lg-6">
                    <div class="tp-portfolio-details-1-thumb-2 mb-20">
                        <img data-speed=".8"
                            src={getImgSrc(data.project.images[1])} alt="">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="tp-portfolio-details-1-thumb-3 mb-20">
                        <img data-speed=".8"
                            src={getImgSrc(data.project.images[2])} alt="">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- portfolio details thumb area start -->


    <!-- portfolio details about start -->
    <div class="tp-portfolio-details-1-about-ptb pb-150">
        <div class="container container-1230">
            <div class="row">
                <div class="col-xl-6 col-lg-5">
                    <div class="tp-pd-1-about-heading tp_fade_anim" data-delay=".3">
                        <span class="tp-pd-1-about-title">About <br>
                            Our project <svg xmlns="http://www.w3.org/2000/svg" width="102" height="9"
                                viewBox="0 0 102 9" fill="none">
                                <path
                                    d="M98 7.91996L101.5 4.43813L98 0.956299M1 3.99989H101V4.99989H1V3.99989Z"
                                    stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                    </div>
                </div>
                <div class="col-xl-6 col-lg-7">
                    <div class="tp-portfolio-details-1-about-content">
                        <h3 class="tp-pd-1-about-text">{data.project.about_desc}</h3>
                        <div class="tp-pd-1-about-list">
                            <ul>
                                {#each data.project.about_list as item}
                                <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- portfolio details about end -->



    <!-- portfolio details work start -->
    <div class="tp-pd-1-work-ptb pb-130">
        <div class="container container-1230">
            <div class="tp-pd-1-work-top pb-70">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="tp-pd-1-work-heading pb-60 tp_fade_anim" data-delay=".3">
                            <h2 class="tp-pd-1-work-title">Work <br>
                                overview</h2>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="tp-pd-1-work-heading tp_fade_anim" data-delay=".5">
                            <span class="tp-pd-1-about-title">OUR <br>
                                APPROACH <svg xmlns="http://www.w3.org/2000/svg" width="102" height="9"
                                    viewBox="0 0 102 9" fill="none">
                                    <path
                                        d="M98 7.91996L101.5 4.43813L98 0.956299M1 3.99989H101V4.99989H1V3.99989Z"
                                        stroke="white" stroke-linecap="round" stroke-linejoin="round">
                                    </path>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="tp-pd-1-work-content pl-20 tp_fade_anim" data-delay=".5">
                            <p>{data.project.overview_desc}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- portfolio details work end -->


</main>