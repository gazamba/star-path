# ⭐ StarPath - Video to Playwright Test Generator

Transform video recordings into comprehensive Playwright test prompts using Claude Vision API. Record a user flow, upload the video, and get detailed test scenarios ready for your AI coding assistant.

---

## Features

- 🎥 **Video Analysis**: Automatically analyzes uploaded video recordings.
- 🚀 **Large File Support**: Supports high-quality recordings (up to 100MB+) even on Vercel by using Supabase Storage.
- 🤖 **AI-Powered**: Uses Claude 3.5 Sonnet Vision to understand user interactions and visual state.
- ✅ **Comprehensive Tests**: Generates prompts for:
  - **Happy Path**: Step-by-step replication of the flow.
  - **Edge Cases**: Validation, empty states, and boundary conditions.
  - **Failure Scenarios**: API errors, timeouts, and network issues.
- 🎯 **Best Practices**: Includes Playwright selector strategies (ARIA, IDs) and Page Object Model (POM) suggestions.
- ♿ **Accessibility**: Suggests keyboard navigation and screen reader compatibility tests.

## Running Locally

To run StarPath on your own machine, follow these steps:

### Prerequisites

- **Node.js 18+**
- **pnpm** (recommended), npm, or yarn
- **FFmpeg** (required for frame extraction from videos)
- **Anthropic API key** (Claude)

#### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) or use Chocolatey: `choco install ffmpeg`

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gabrielazambuja/star-path.git
   cd star-path
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your [Anthropic API key](https://console.anthropic.com/settings/keys) and [Supabase credentials](https://supabase.com/dashboard/project/_/settings/api):
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

5. **Supabase Storage Setup**
   - Create a **public** bucket named `star-path`.
   - **Important: Set RLS Policies**:
     - Go to **Storage -> Policies**.
     - Add a policy for the `star-path` bucket: **"Allow public to upload"** (requires `INSERT` permission).
     - Add a policy for the `star-path` bucket: **"Allow public to read"** (requires `SELECT` permission).

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Technical Details

- **Framework**: Next.js 16 (App Router)
- **AI Integration**: Anthropic Claude 3.5 Sonnet SDK
- **Video Logic**: `fluent-ffmpeg` for frame extraction, `ffmpeg-static` for portable binaries.
- **Styling**: Tailwind CSS 4.0
- **Timeout Management**: Vercel-friendly 55s timeout handling for long-running AI analysis.
- **Upload Limits**: 100MB+ supported both locally and on Vercel (via Supabase Storage).

## Project Structure

```
star-path/
├── app/                  # Next.js Pages & API Routes
├── components/           # UI Components (VideoForm, PromptOutput)
├── lib/                  # Core Logic (video processing, Claude API)
├── public/               # Static assets
└── .env.local.example    # Env template
```

## License

MIT

