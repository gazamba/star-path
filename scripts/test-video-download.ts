import { downloadVideoFromUrl } from '../lib/video';
import { promises as fs } from 'fs';

async function main() {
    const loomUrl = 'https://www.loom.com/share/e3918014b90944e59bd96e23566ac120';
    console.log(`Testing download for: ${loomUrl}`);

    try {
        const filePath = await downloadVideoFromUrl(loomUrl);
        console.log(`Success! Video downloaded to: ${filePath}`);

        const stats = await fs.stat(filePath);
        console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

        // Cleanup
        // await fs.unlink(filePath);
        // console.log('Temporary file cleaned up.');
    } catch (error) {
        console.error('Download failed:', error);
        process.exit(1);
    }
}

main();
