import re

with open('/Users/stevenchristian/Desktop/agntix/portfolio-details-classic-stack.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract from <main> to </main>
match = re.search(r'<main>.*?</main>', html, flags=re.DOTALL)
if match:
    main_content = match.group(0)
else:
    print("Could not find <main> tags in portfolio-details-classic-stack.html")
    main_content = ""

# Create the new route directory
import os
os.makedirs('/Users/stevenchristian/Desktop/agntix/steven/steven/src/routes/portfolio-details', exist_ok=True)

# Write to +page.svelte
with open('/Users/stevenchristian/Desktop/agntix/steven/steven/src/routes/portfolio-details/+page.svelte', 'w', encoding='utf-8') as f:
    f.write(main_content)

print("Created portfolio-details page.")
