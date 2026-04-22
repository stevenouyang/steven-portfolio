import re

with open('/Users/stevenchristian/Desktop/agntix/index-personal-portfolio-dark.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract from <main> to </main>
main_part = html[html.find('<main>'):html.find('</main>') + 7]

# Extract the <div class="row gx-40"> ... </div> block inside the project section
project_row_start = main_part.find('<div class="row gx-40">')
project_row_end = main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', main_part.find('</div>', project_row_start) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 6

# Let's use regex to extract the block safely
match = re.search(r'<div class="row gx-40">.*?</script>|<!-- text slider area start -->', main_part, flags=re.DOTALL)
# Actually, the block starts at <div class="row gx-40"> and ends before </div>\n                    </div>\n                </div>\n                <!-- project area end -->
project_area_end = main_part.find('<!-- project area end -->')
# Find the exact row gx-40 block
row_gx_40_start = main_part.find('<div class="row gx-40">')
row_gx_40_end = main_part.rfind('</div>', row_gx_40_start, main_part.find('</div>\n                </div>\n                <!-- project area end -->')) + 6

projects_svelte = """
                        <div class="row gx-40">
                            {#each projects as project}
                            <div class="col-lg-6 tp_fade_anim" data-delay={project.delay} data-fade-from={project.fadeFrom}>
                                <div class="pp-project-item tp--hover-item mb-65">
                                    <div class="pp-project-item-thumb not-hide-cursor" data-cursor="View<br>Demo">
                                        <a class="cursor-hide" href={project.link}>
                                            <img src={project.image} alt="">
                                        </a>
                                    </div>
                                    <div class="pp-project-item-contenet">
                                        <h4 class="pp-project-item-title"><a href={project.link}>{project.title}</a></h4>
                                        <span class="pp-project-item-meta">{project.category} - {project.year}</span>
                                    </div>
                                </div>
                            </div>
                            {/each}
                        </div>
"""

# Replace the block
main_part_modified = main_part[:row_gx_40_start] + projects_svelte + main_part[row_gx_40_end:]

script_part = """<script>
    const projects = [
        {
            title: "Corporate Branding",
            category: "Branding",
            year: "2025",
            image: "assets/img/home-04/project/project-4.jpg",
            link: "portfolio-details-modern.html",
            delay: ".3",
            fadeFrom: "left"
        },
        {
            title: "AI in Healthcare",
            category: "Branding",
            year: "2025",
            image: "assets/img/home-04/project/project-5.jpg",
            link: "portfolio-details-modern.html",
            delay: ".5",
            fadeFrom: "right"
        },
        {
            title: "Urban Green Spaces",
            category: "Branding",
            year: "2025",
            image: "assets/img/home-04/project/project-6.jpg",
            link: "portfolio-details-modern.html",
            delay: ".3",
            fadeFrom: "left"
        },
        {
            title: "Logistics Made Simple",
            category: "Branding",
            year: "2025",
            image: "assets/img/home-04/project/project-7.jpg",
            link: "portfolio-details-modern.html",
            delay: ".5",
            fadeFrom: "right"
        }
    ];
</script>

"""

page_svelte = script_part + main_part_modified

with open('/Users/stevenchristian/Desktop/agntix/steven/steven/src/routes/+page.svelte', 'w', encoding='utf-8') as f:
    f.write(page_svelte)
