<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/68e2c0db-f4d1-4886-9441-1ba1724b323b

## Features

### Deep Zoom Medical Viewer
- High-resolution medical image viewing with smooth pan and zoom
- Support for TIF/TIFF medical imaging formats
- Real-time image processing (brightness, contrast)
- Mini-map navigation for large images

### Clinical Annotation System
- **4 Color-Coded Annotation Types:**
  - 🔴 **Red (AC-001)**: Abnormal Cells
  - 🔵 **Blue (MF-002)**: Missing Fungi
  - 🟢 **Green (HT-003)**: Healthy Tissue
  - 🟠 **Orange (IN-004)**: Inflammation
- Freehand drawing with clinical code labels
- Export annotated snippets (512x512 PNG)
- Clear and manage annotations

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Add your TIF medical images to `public/medical-images/` - See [MEDICAL_IMAGES_SETUP.md](MEDICAL_IMAGES_SETUP.md)
4. Run the app:
   `npm run dev`

## Adding Medical Images

The app currently uses placeholder images. To use real high-resolution TIF medical images:

1. Place your TIF files in `public/medical-images/`
2. Name them: `sample1.tif`, `sample2.tif`, `sample3.tif`, `sample4.tif`, `sample5.tif`
3. Update the URLs in `src/App.tsx` to point to your local files

See [MEDICAL_IMAGES_SETUP.md](MEDICAL_IMAGES_SETUP.md) for detailed instructions and free medical image sources.

## Usage

1. **Select a Study**: Choose from 5 clinical studies in the sidebar
2. **View Mode**: Pan (drag) and zoom (scroll) to explore the image
3. **Annotate Mode**: 
   - Click "Annotate" in the toolbar
   - Select a color code (Red/Blue/Green/Orange)
   - Draw on the image to mark regions
4. **Adjust Image**: Use brightness and contrast sliders
5. **Save Snippet**: Export current view with annotations
