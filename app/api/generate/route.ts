import { NextResponse } from "next/server";
import { inferStepsFromVideo } from "@/lib/steps";
import { generatePrompt } from "@/lib/prompt";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";

// Increase timeout for video processing (Vercel has a 60s limit on hobby plan, 300s on Pro)
export const maxDuration = 300;

export async function POST(req: Request) {
    try {
        const { loomUrl: lUrl, videoUrl: vUrl } = await req.json();
        const videoUrl = lUrl || vUrl;

        if (!videoUrl) {
            return NextResponse.json({ error: "No video URL provided" }, { status: 400 });
        }

        // Check for API key
        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: "Server configuration error: ANTHROPIC_API_KEY is not set" },
                { status: 500 }
            );
        }

        // Process video and infer steps with timeout
        const isVercel = (!!process.env.VERCEL || !!process.env.VERCEL_ENV) && process.env.NODE_ENV === 'production';
        const timeoutMs = isVercel ? 290000 : 360000; // 290s for Vercel, 6m for local

        const inferencePromise = inferStepsFromVideo(videoUrl, true);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Video processing timeout')), timeoutMs)
        );

        const result = await Promise.race([inferencePromise, timeoutPromise])
            .catch((error) => {
                if (error.message === 'Video processing timeout') {
                    const limitMessage = isVercel
                        ? 'Video processing took too long (Vercel has a 60s limit). Please try with a shorter video or run the app locally.'
                        : 'Video processing took too long (5 minute limit). Please try with a shorter video.';
                    throw new Error(limitMessage);
                }
                throw error;
            });

        const { steps, context } = result as Awaited<ReturnType<typeof inferStepsFromVideo>>;

        // Generate comprehensive prompt
        const prompt = generatePrompt({
            framework: "Next.js (App Router)",
            testRunner: "Playwright",
            steps,
            context,
        });

        return NextResponse.json({
            prompt,
            metadata: {
                stepCount: steps.length,
                applicationType: context.applicationContext.type,
                framework: context.applicationContext.framework,
                edgeCaseCount: context.edgeCases.length,
                potentialIssueCount: context.potentialIssues.length,
            },
        });
    } catch (error) {
        console.error('Error in /api/generate:', error);

        // Handle specific error types
        if (error instanceof Error) {
            // Generic error with message
            return NextResponse.json(
                {
                    error: "An error occurred",
                    details: error.message,
                },
                { status: 500 }
            );
        }

        // Unknown error
        return NextResponse.json(
            {
                error: "An unexpected error occurred",
                details: "Please try again later.",
            },
            { status: 500 }
        );
    }
}

