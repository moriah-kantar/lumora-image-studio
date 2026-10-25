# Lumora

**Author:** Moriah Kantar  
**Launched:** October 2026

**An image scaling and editing studio built for a flexible, streamlined creative workflow.**

Lumora is a browser-based application for resizing images, fine-tuning their appearance, comparing edits, saving reusable presets, compressing files, and exporting images in different formats. The project focuses on practical image controls through a clean, approachable interface.

---

## 🚀 Try Lumora

[![Launch Lumora](https://img.shields.io/badge/Launch-Lumora_Image_Studio-blue?style=for-the-badge)](https://moriah-kantar.github.io/lumora-image-studio/)

**[Open the live application](https://moriah-kantar.github.io/lumora-image-studio/)** — use Lumora directly in your browser without installing software.

---

## Features

- **Image resizing and scaling** — adjust image dimensions for different uses, with scaling and sharpening controls.
- **Image adjustments** — fine-tune exposure, contrast, highlights, shadows, clarity, texture, and more.
- **Saved presets and favorites** — quickly apply and reuse preferred editing settings.
- **Before-and-after comparison** — compare original and processed images using a split slider or alternate viewing modes.
- **Background and gradient tools** — customize the image canvas or background.
- **Compression controls** — balance output quality and file size.
- **Multiple export formats** — options include PNG, JPEG, WebP, AVIF, BMP, TIFF, and ICO, depending on browser and encoder support.
- **Light and dark themes** — choose a comfortable editing workspace.
- **Browser-based processing** — image editing is designed to run client-side.

> Availability and behavior of some export formats and processing features may vary by browser.

---

## 📸 Application Showcase

### 1. Image Upload

Upload an image from your device or try one of Lumora's sample images.

![Lumora image upload screen](screenshots/lumora-home.png)

### 2. Interactive Image Editor

Compare original and edited images with the before-and-after slider.

![Lumora image editing workspace](screenshots/lumora-editor.png)

### 3. Creative Presets

Explore and apply image looks, including cinematic, portrait, and black-and-white presets.

![Lumora adjustment presets](screenshots/lumora-presets.png)

### 4. Advanced Adjustments

Refine tone, detail, sharpness, and image clarity using individual controls.

![Lumora image adjustment controls](screenshots/lumora-adjustments.png)

### 5. Export and Compression

Choose an output format and adjust compression before downloading your image.

![Lumora export options](screenshots/lumora-export.png)

---

## Built With

- **React** — component-based user interface
- **TypeScript** — typed application code
- **Vite** — development tooling and production builds
- **Tailwind CSS** — interface styling
- **GitHub Actions and GitHub Pages** — automated deployment and public hosting

---

## Getting Started

### Requirements

- Node.js and npm

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/moriah-kantar/lumora-image-studio.git
   cd lumora-image-studio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL displayed in your terminal.

### Production Build

To create a production build:

```bash
npm run build
```

> If a future version adds features that require API credentials, store credentials securely and never commit `.env.local` or API keys. Do not expose private API keys in client-side code.

---

## Project Status

**Live — with ongoing improvements.**

Lumora is deployed publicly through GitHub Pages and remains an evolving personal software project.

### Live Website

https://moriah-kantar.github.io/lumora-image-studio/

### Source Code

https://github.com/moriah-kantar/lumora-image-studio

---

## Security and Privacy Notes

- Lumora's editing workflow is designed for client-side processing.
- Never commit API keys, passwords, or local environment files to this repository.
- GitHub Pages hosts static front-end files; any future secret-backed features would require a secure backend.

---

## About This Project

Lumora is an independently developed project exploring image-processing workflows, modern web application design, front-end development, and iterative, AI-assisted software development.

The project demonstrates practical experience with:

- Developing a responsive web application.
- Designing interactive user interfaces.
- Implementing browser-based image processing.
- Creating reusable application components.
- Managing source code with GitHub.
- Automating builds and deployments with GitHub Actions.
- Publishing and maintaining a publicly accessible application.

---

**Developed by Moriah Kantar | October 2026**

[Launch Lumora Image Studio](https://moriah-kantar.github.io/lumora-image-studio/)
