export async function load({ fetch, params }) {
    // Fetch project details from the Django API using the dynamic ID
    const res = await fetch(`/api/projects/${params.id}/`);
    
    if (res.ok) {
        const data = await res.json();
        return {
            project: data.project
        };
    } else {
        // If the project is not found, you can return a 404 or a fallback
        return {
            status: res.status,
            error: new Error('Project not found')
        };
    }
}
