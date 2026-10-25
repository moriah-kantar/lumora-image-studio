# Lumora

**Author:** Moriah Kantar

**Completed:** October 2026

**An image scaling and editing studio built for a flexible, streamlined creative workflow.**

Lumora is a web application for resizing images, fine-tuning their appearance, comparing edits, saving reusable presets, and exporting images in different formats. The project focuses on giving users practical image controls through a clean, approachable interface.

## Features

- **Image resizing and scaling** — prepare images for different sizes and uses.
- **Image adjustments** — fine-tune the appearance of uploaded images.
- **Saved presets and favorites** — reuse preferred editing settings.
- **Before-and-after comparison** — preview adjustments against the original.
- **Background and gradient tools** — customize the image canvas or background.
- **Multiple export formats** — options include PNG, JPEG, WebP, AVIF, BMP, TIFF, and ICO, depending on browser and encoder support.
- **Light and dark themes** — choose a comfortable workspace.

> Feature support and export availability may vary by the current build and browser. This README describes the project's intended/current feature set; verify each feature against the uploaded source before publishing a release.

## Built With

- React
- TypeScript
- Vite
- Tailwind CSS

## Getting Started

### Requirements

- Node.js and npm

### Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/moriah-kantar/lumora-image-studio.git
   cd lumora-image-studio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. If your version of the project requires Gemini integration, configure the necessary environment variables in `.env.local`. **Never commit this file or any API keys.**
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the local address shown in the terminal (the current Vite configuration uses port **3000**).

### Other commands

```bash
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run TypeScript checks
```

## Project Status

**Personal project — in development.** This repository documents the app's source code and ongoing improvements.

## Security Notes

- Keep `.env.local`, API keys, and other secrets out of version control.
- Any key embedded in browser-delivered JavaScript is visible to users. Use a server-side endpoint for secret-backed API calls before publicly deploying those features.

## About This Project

Lumora is an independently developed portfolio project exploring modern web app design, image-processing workflows, front-end development, and iterative, AI-assisted software development.
