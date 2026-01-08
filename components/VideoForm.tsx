"use client";

import { useState, useRef } from "react";
import PromptOutput from "./PromptOutput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Upload, FileVideo, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function VideoForm() {
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setPrompt(null);
        setMetadata(null);
        setError(null);
        setErrorDetails(null);
        setLoadingStep("Uploading to Supabase...");

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = fileName; // Upload directly to root

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('star-path')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('star-path')
                .getPublicUrl(filePath);

            setLoadingStep("Analyzing video...");

            // 3. Send URL to our API
            const res = await fetch("/api/generate", {
                method: "POST",
                body: JSON.stringify({ videoUrl: publicUrl }),
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                setErrorDetails(data.details || null);
            } else {
                setPrompt(data.prompt);
                setMetadata(data.metadata);
            }

            // Optional: Clean up Supabase file after processing (or leave for history)
            // await supabase.storage.from('videos').remove([filePath]);

        } catch (err) {
            setError("Processing failed");
            setErrorDetails(err instanceof Error ? err.message : "Failed to process the video. Please try again.");
        } finally {
            setLoading(false);
            setLoadingStep("");
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const limit = 100 * 1024 * 1024; // 100MB limit for everyone now

            if (selectedFile.size > limit) {
                setError("File too large");
                setErrorDetails("Please keep videos under 100MB to ensure smooth processing.");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setErrorDetails(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

    return (
        <div className="space-y-6">
            <Card className="p-8 bg-white/5 backdrop-blur-md border-white/10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-purple-100">
                            Upload Video Flow
                        </label>

                        {!file ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                            >
                                <div className="p-4 rounded-full bg-purple-500/10 group-hover:scale-110 transition-transform mb-4">
                                    <Upload className="h-8 w-8 text-purple-400" />
                                </div>
                                <p className="text-sm text-purple-100 font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-purple-300/60 mt-2">
                                    MP4, MOV or WebM (Max 100MB)
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 p-4 border border-purple-500/30 rounded-xl bg-purple-500/5 backdrop-blur-sm">
                                <div className="p-3 rounded-lg bg-purple-500/20">
                                    <FileVideo className="h-6 w-6 text-purple-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                    <p className="text-xs text-purple-300/70">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearFile}
                                    className="text-purple-300/60 hover:text-white hover:bg-white/10"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        <p className="text-xs text-purple-300/60">
                            Upload your user flow video to generate comprehensive Playwright test prompts
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-6 text-base shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Generate Test Prompt
                            </>
                        )}
                    </Button>

                    {loading && (
                        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                                    <p className="text-sm text-purple-100 font-medium">{loadingStep}</p>
                                </div>
                                <div className="space-y-2 text-xs text-purple-300/70">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        <p>Uploading video...</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                        <p className="text-purple-200">Extracting frames...</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40" />
                                        <p>Analyzing with AI...</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40" />
                                        <p>Generating test prompt...</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {error && (
                        <Alert className="bg-red-500/10 border-red-500/20 backdrop-blur-sm">
                            <AlertDescription className="text-red-200">
                                <p className="font-medium">{error}</p>
                                {errorDetails && (
                                    <p className="text-xs text-red-300/80 mt-1">{errorDetails}</p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </form>
            </Card>

            {prompt && <PromptOutput prompt={prompt} metadata={metadata} />}
        </div>
    );
}
