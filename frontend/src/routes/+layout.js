export const ssr = true;
export const prerender = false;

export async function load({ fetch }) {
    try {
        const res = await fetch('/api/projects/');
        if (res.ok) {
            const data = await res.json();
            return {
                projects: data.projects
            };
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
    return {
        projects: []
    };
}
