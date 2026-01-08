import VideoForm from "@/components/VideoForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
          <span className="text-3xl">⭐</span>
          <span className="text-sm font-medium text-purple-200">AI-Powered Test Generation</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 leading-tight">
          StarPath
        </h1>

        <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto font-light">
          Transform video recordings into comprehensive Playwright test prompts using Claude Vision AI
        </p>

        <p className="text-sm text-purple-300/80 max-w-xl mx-auto">
          Upload your user flow recording (MP4, MOV, WebM) and get detailed test scenarios ready for Cursor or Claude to generate production-ready tests.
        </p>
      </div>

      {/* How it Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎥</div>
          <h3 className="text-lg font-semibold text-white mb-2">Record Flow</h3>
          <p className="text-sm text-purple-200/70">Capture your user flow in a video recording</p>
        </Card>

        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
          <p className="text-sm text-purple-200/70">Claude Vision analyzes each step and interaction</p>
        </Card>

        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✅</div>
          <h3 className="text-lg font-semibold text-white mb-2">Generate Tests</h3>
          <p className="text-sm text-purple-200/70">Get prompts for happy path, edge cases, and failures</p>
        </Card>
      </div>

      {/* Main Form */}
      <VideoForm />

      {/* Features */}
      <Card className="p-8 my-12 bg-white/5 backdrop-blur-md border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">✨</span>
          What You Get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "🎯", title: "Happy Path Tests", desc: "Exact replication of your recorded flow" },
            { icon: "🔍", title: "Edge Cases", desc: "Form validation, boundary conditions, empty states" },
            { icon: "⚠️", title: "Failure Scenarios", desc: "Network errors, API failures, timeouts" },
            { icon: "📚", title: "Best Practices", desc: "Playwright selector strategies, Page Object Model" },
            { icon: "♿", title: "Accessibility Tests", desc: "Keyboard navigation, ARIA labels, focus management" },
            { icon: "🚀", title: "Production Ready", desc: "Copy-paste into Cursor or Claude for instant tests" },
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-2xl mt-0.5">{feature.icon}</span>
              <div>
                <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                <p className="text-xs text-purple-200/70 mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Demo Page CTA */}
      <Card className="p-6 mb-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🎬</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Need a Demo to Record?
            </h3>
            <p className="text-sm text-purple-200/80 mb-4">
              Try our interactive demo page! It has a complete user flow with login, task management, and settings - perfect for recording your first walk-through video.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <a href="/demo">
                Open Demo Page →
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-16 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-purple-300/60">
          <span>Powered by</span>
          <Badge variant="outline" className="border-purple-500/30 text-purple-200">Claude Vision</Badge>
          <span>+</span>
          <Badge variant="outline" className="border-purple-500/30 text-purple-200">FFmpeg</Badge>
        </div>
      </div>
    </main>
  );
}


