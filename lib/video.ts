import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const IS_VERCEL = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
const IS_PROD = process.env.NODE_ENV === 'production';

let ffmpegPath: string | null = null;

try {
    if (IS_VERCEL) {
        // Prefer the isolated binary we copy during build
        ffmpegPath = path.join(process.cwd(), 'bin', 'ffmpeg');
        console.log(`Checking isolated FFmpeg: ${ffmpegPath}`);
    } else {
        const req = eval('require');
        const ffmpegInstaller = req('@ffmpeg-installer/ffmpeg');
        ffmpegPath = ffmpegInstaller.path;
    }
} catch (e) {
    console.warn('Could not load bundled ffmpeg:', (e as Error).message);
    // Hard fallback for Vercel
    if (IS_VERCEL) {
        ffmpegPath = path.join(process.cwd(), 'bin', 'ffmpeg');
    }
}

/**
 * Helper to get video duration using ffmpeg instead of ffprobe
 * to save ~75MB in the serverless bundle size.
 */
async function getVideoDuration(videoPath: string, ffmpegPath: string): Promise<number> {
    try {
        // ffmpeg -i outputs duration to stderr. 
        // We use a harmless command that returns quickly.
        const { stderr } = await execAsync(`"${ffmpegPath}" -i "${videoPath}"`);
        return parseDuration(stderr);
    } catch (e: any) {
        // ffmpeg -i without output file returns exit code 1, but still has the info in stderr
        return parseDuration(e.stderr || '');
    }
}

function parseDuration(text: string): number {
    const match = text.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (match) {
        const [_, h, m, s] = match;
        return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
    }
    return 30; // Fallback
}

// Helper to ensure binaries are executable (important for Vercel)
async function ensureExecutable(filePath: string) {
    if (!filePath || typeof filePath !== 'string') return;

    try {
        const stats = await fs.stat(filePath);
        // Add execute permission if missing (0o755 = rwxr-xr-x)
        if (!(stats.mode & 0o111)) {
            // On Vercel, the filesystem might be read-only except for /tmp
            // We try to chmod, but if it fails we just log it
            await fs.chmod(filePath, 0o755);
            console.log(`✓ Granted execute permission to: ${filePath}`);
        }
    } catch (err) {
        console.warn(`Note: Could not check/set permissions for ${filePath}:`, (err as Error).message);
    }
}

// Configure fluent-ffmpeg to use bundled binary
if (ffmpegPath) {
    console.log(`Using bundled FFmpeg: ${ffmpegPath}`);
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export interface FrameExtractionOptions {
    frameCount?: number;
    quality?: number;
}

/**
 * Validates if the file is a supported video format
 */
export function isValidVideoFile(fileName: string): boolean {
    const supported = ['.mp4', '.mov', '.webm', '.avi'];
    const ext = path.extname(fileName).toLowerCase();
    return supported.includes(ext);
}
/**
 * Downloads a video from a URL to a temporary file
 */
export async function downloadVideoFromUrl(url: string): Promise<string> {
    const isLoom = isValidLoomUrl(url);
    const uniqueId = Date.now();
    const tempDir = tmpdir();

    if (isLoom) {
        return downloadLoomVideoInternal(url);
    }

    // Generic download for other URLs (like Supabase Storage)
    try {
        console.log(`Downloading generic video from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }

        const urlObj = new URL(url);
        const ext = path.extname(urlObj.pathname) || '.mp4';
        const tempFilePath = path.join(tempDir, `video-${uniqueId}${ext}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(tempFilePath, buffer);
        console.log(`✓ Video downloaded successfully to: ${tempFilePath}`);

        return tempFilePath;
    } catch (error) {
        console.error('Error downloading video:', error);
        throw error;
    }
}

/**
 * Loom-specific download logic
 */
async function downloadLoomVideoInternal(url: string): Promise<string> {
    const videoId = extractLoomVideoId(url);
    if (!videoId) {
        throw new Error('Could not extract video ID from Loom URL.');
    }

    try {
        const oembedUrl = `https://www.loom.com/v1/oembed?url=${encodeURIComponent(url)}`;
        console.log(`Fetching oembed data from: ${oembedUrl}`);

        const oembedResponse = await fetch(oembedUrl);
        if (!oembedResponse.ok) {
            throw new Error('Could not access video. The video might be private or the URL might be incorrect.');
        }

        const oembedData = await oembedResponse.json();
        const thumbnailUrl = oembedData.thumbnail_url;
        const hashMatch = thumbnailUrl?.match(new RegExp(`${videoId}-([a-f0-9]+)\\.`));
        const hash = hashMatch ? hashMatch[1] : null;

        // Try multiple CDN URL patterns. 
        const possibleUrls = [
            `https://cdn.loom.com/sessions/${videoId}/transcoded/mp4/1080/video.mp4`,
            `https://cdn.loom.com/sessions/${videoId}/transcoded/mp4/720/video.mp4`,
            `https://cdn.loom.com/sessions/original/${videoId}.mp4`,
            `https://cdn.loom.com/sessions/transcoded/${videoId}.mp4`,
            hash ? `https://cdn.loom.com/sessions/thumbnails/${videoId}-${hash}.mp4` : null,
        ].filter((url): url is string => url !== null);

        let videoUrl: string | null = null;
        for (const testUrl of possibleUrls) {
            try {
                console.log(`Checking URL: ${testUrl}`);
                const response = await fetch(testUrl, { method: 'HEAD' });
                if (response.ok) {
                    videoUrl = testUrl;
                    console.log(`✓ Found working video URL: ${videoUrl}`);
                    break;
                }
            } catch (err) {
                continue;
            }
        }

        if (!videoUrl) {
            throw new Error('Could not find accessible video URL.');
        }

        const tempDir = tmpdir();
        const tempFilePath = path.join(tempDir, `loom-${videoId}-${Date.now()}.mp4`);

        console.log(`Downloading video...`);
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }

        const buffer = Buffer.from(await videoResponse.arrayBuffer());
        await fs.writeFile(tempFilePath, buffer);
        console.log(`✓ Video downloaded successfully to: ${tempFilePath}`);

        return tempFilePath;
    } catch (error) {
        console.error('Error downloading Loom video:', error);
        throw error;
    }
}

/**
 * Extracts a single frame at a specific timestamp
 */
async function extractFrameAtTimestamp(
    videoPath: string,
    timestamp: number,
    outputPath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .setStartTime(timestamp)
            .frames(1)
            .output(outputPath)
            .outputOptions(['-vframes', '1', '-q:v', '2', '-vf', 'scale=1280:-1'])
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

/**
 * Extracts frames from a video file using precise seeking
 */
export async function extractFrames(
    videoPath: string,
    options: FrameExtractionOptions = {}
): Promise<string[]> {
    const { frameCount = 30 } = options;

    return new Promise(async (resolve, reject) => {
        const uniqueId = Date.now();
        const tempDir = path.join(tmpdir(), `starpath-frames-${uniqueId}`);
        // Only use public/debug-frames in local development if specifically needed
        // On Vercel, public is read-only.
        const debugDir = !IS_VERCEL && !IS_PROD ? path.join(process.cwd(), 'public', 'debug-frames') : null;

        try {
            if (ffmpegPath) await ensureExecutable(ffmpegPath);

            await fs.mkdir(tempDir, { recursive: true });

            if (debugDir) {
                try {
                    await fs.mkdir(debugDir, { recursive: true });
                    // Clean debug dir
                    const oldFiles = await fs.readdir(debugDir);
                    await Promise.all(oldFiles.map(f => fs.unlink(path.join(debugDir, f))));
                } catch (e) {
                    console.warn('Could not setup debug directory:', (e as Error).message);
                }
            }

            // Get video duration using our custom helper (saving ~75MB by skipping ffprobe)
            const duration = ffmpegPath ? await getVideoDuration(videoPath, ffmpegPath) : 30;
            console.log(`Probing video: ${duration}s total. Extracting ${frameCount} frames...`);

            const base64Frames: string[] = [];

            // Extract frames sequentially to ensure seeking works correctly
            for (let i = 0; i < frameCount; i++) {
                // Avoid seeking to the exact end of the video, as it often fails with ENOENT
                // We cap the timestamp at 98% of the duration to be safe
                const safeDuration = duration * 0.98;
                const timestamp = (safeDuration / (frameCount - 1)) * i;
                const fileName = `frame-${i.toString().padStart(3, '0')}.jpg`;
                const tempPath = path.join(tempDir, fileName);

                try {
                    await extractFrameAtTimestamp(videoPath, timestamp, tempPath);
                    // Convert to base64
                    const buffer = await fs.readFile(tempPath);
                    base64Frames.push(buffer.toString('base64'));

                    // Copy to debug if available
                    if (debugDir) {
                        try {
                            await fs.copyFile(tempPath, path.join(debugDir, fileName));
                        } catch (e) { }
                    }
                } catch (frameErr) {
                    console.error(`Failed to extract frame at ${timestamp}s:`, frameErr);
                }
            }

            console.log(`✓ Successfully extracted ${base64Frames.length} frames across the entire video.`);

            // Cleanup temp frames immediately
            try {
                const files = await fs.readdir(tempDir);
                await Promise.all(files.map(f => fs.unlink(path.join(tempDir, f))));
                await fs.rmdir(tempDir);
            } catch (e) { }

            resolve(base64Frames);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Cleans up temporary files
 */
export async function cleanupTempFiles(paths: string[]): Promise<void> {
    await Promise.all(
        paths.map(async (filePath) => {
            try {
                await fs.unlink(filePath);
            } catch (error) { }
        })
    );
}

function isValidLoomUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'www.loom.com' || urlObj.hostname === 'loom.com';
    } catch {
        return false;
    }
}

function extractLoomVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const shareIndex = pathParts.indexOf('share');
        if (shareIndex !== -1 && pathParts[shareIndex + 1]) {
            return pathParts[shareIndex + 1];
        }
        return null;
    } catch {
        return null;
    }
}
