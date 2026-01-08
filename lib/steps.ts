import { extractFrames, cleanupTempFiles, downloadVideoFromUrl } from './video';
import { analyzeVideoFrames, AnalysisResult } from './claude';

export type Step =
    | { type: "navigate"; value: string }
    | { type: "input"; value: string }
    | { type: "click"; value: string }
    | { type: "assert"; value: string };

export interface InferenceResult {
    steps: Step[];
    context: AnalysisResult;
}

export async function inferStepsFromVideo(
    videoSource: string,
    isUrl: boolean = false
): Promise<InferenceResult> {
    let videoPath: string | null = null;
    const tempFiles: string[] = [];

    try {
        if (isUrl) {
            // Download the video from URL
            videoPath = await downloadVideoFromUrl(videoSource);
            tempFiles.push(videoPath);
        } else {
            // Use the provided local path
            videoPath = videoSource;
        }

        // Extract frames from the video
        const frames = await extractFrames(videoPath, {
            frameCount: 30,
            quality: 2,
        });

        // Analyze frames with Claude Vision
        const analysis = await analyzeVideoFrames(frames);

        // Convert analysis steps to our Step format
        const steps: Step[] = analysis.steps.map((step) => {
            // Map the action type to our Step types
            switch (step.action.toLowerCase()) {
                case 'navigate':
                    return { type: 'navigate', value: step.element };
                case 'type':
                case 'input':
                case 'fill':
                    return { type: 'input', value: step.element };
                case 'click':
                case 'press':
                case 'tap':
                case 'toggle':
                case 'check':
                case 'uncheck':
                    return { type: 'click', value: step.element };
                case 'assert':
                case 'verify':
                case 'check visibility':
                    return { type: 'assert', value: step.expectedResult || step.description };
                default:
                    return { type: 'assert', value: step.expectedResult || step.description };
            }
        });

        return {
            steps,
            context: analysis,
        };
    } finally {
        // Clean up temporary files
        if (tempFiles.length > 0) {
            await cleanupTempFiles(tempFiles);
        }
    }
}

