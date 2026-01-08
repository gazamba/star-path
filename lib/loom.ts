export function validateLoomUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.hostname.includes("loom.com");
    } catch {
        return false;
    }
}
