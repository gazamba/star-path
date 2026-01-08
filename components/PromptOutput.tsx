"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Lightbulb } from "lucide-react";

interface PromptOutputProps {
    prompt: string;
    metadata?: {
        stepCount: number;
        applicationType: string;
        framework?: string;
        edgeCaseCount: number;
        potentialIssueCount: number;
    };
}

export default function PromptOutput({ prompt, metadata }: PromptOutputProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Card className="p-8 bg-white/5 backdrop-blur-md border-white/10">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        Generated Playwright Test Prompt
                    </h3>

                    <Button
                        onClick={handleCopy}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                    >
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy to Clipboard
                            </>
                        )}
                    </Button>
                </div>

                {/* Metadata */}
                {metadata && (
                    <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                            {metadata.stepCount} Steps
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                            {metadata.applicationType}
                        </Badge>
                        {metadata.framework && (
                            <Badge variant="secondary" className="bg-pink-500/20 text-pink-200 border-pink-500/30">
                                {metadata.framework}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-500/30">
                            {metadata.edgeCaseCount} Edge Cases
                        </Badge>
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-200 border-orange-500/30">
                            {metadata.potentialIssueCount} Potential Issues
                        </Badge>
                    </div>
                )}

                {/* Prompt Output */}
                <div className="relative">
                    <Textarea
                        readOnly
                        value={prompt}
                        rows={20}
                        className="w-full resize-none rounded-lg border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-purple-100 outline-none font-mono backdrop-blur-sm"
                    />
                </div>

                {/* Usage Instructions */}
                <Alert className="bg-blue-500/10 border-blue-500/20 backdrop-blur-sm">
                    <Lightbulb className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200 text-sm ml-2">
                        <strong>Next steps:</strong> Copy this prompt and paste it into Cursor, Claude, or your preferred AI coding assistant to generate the complete Playwright test file.
                    </AlertDescription>
                </Alert>
            </div>
        </Card>
    );
}
