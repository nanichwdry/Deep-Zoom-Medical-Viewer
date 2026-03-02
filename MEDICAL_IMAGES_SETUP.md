# Medical Image Setup Guide

## Quick Setup with Sample Images

Since TIF files are large, you have two options:

### Option 1: Use Placeholder Images (For Testing)
The app will work with any image format. You can temporarily use JPG/PNG files:

1. Download any medical-looking images and place them in `public/medical-images/`
2. Name them: sample1.jpg, sample2.jpg, sample3.jpg, sample4.jpg, sample5.jpg
3. Update the URLs in `src/App.tsx` to use `.jpg` instead of `.tif`

### Option 2: Use Real High-Resolution TIF Images

#### Free Medical Image Sources:

1. **OpenSlide Demo Images** (Recommended)
   - Visit: https://openslide.org/demo/
   - Download sample whole-slide images
   - Convert to TIF if needed

2. **Cancer Imaging Archive**
   - Visit: https://www.cancerimagingarchive.net/
   - Browse collections
   - Download pathology images

3. **NIH NCI GDC Data Portal**
   - Visit: https://portal.gdc.cancer.gov/
   - Search for tissue slide images
   - Download with proper attribution

4. **Create Sample TIF Files**
   ```bash
   # Using ImageMagick (if installed)
   convert sample.jpg -resize 8000x6000 sample1.tif
   ```

## Features Added:

### Color Annotation System
- **Red (AC-001)**: Abnormal Cells - Mark cancerous or abnormal cellular structures
- **Blue (MF-002)**: Missing Fungi - Identify areas lacking expected fungal presence
- **Green (HT-003)**: Healthy Tissue - Highlight normal, healthy tissue regions
- **Orange (IN-004)**: Inflammation - Mark inflammatory responses

### How to Use:
1. Click "Annotate" mode in the toolbar
2. Select a color code from the palette
3. Draw on the image to mark regions
4. Each annotation is saved with its clinical code
5. Export annotated images with "Save Snippet"

## Image Specifications:
- **Format**: TIFF (.tif or .tiff)
- **Resolution**: 8000 x 6000 px (or higher for deep zoom)
- **Color Mode**: RGB or Grayscale
- **Bit Depth**: 8-bit or 16-bit per channel
- **Compression**: LZW, ZIP, or uncompressed

## Privacy & Compliance:
⚠️ **IMPORTANT**: When using real medical images:
- Ensure HIPAA compliance
- Remove all patient identifiers
- Obtain proper permissions
- Use only de-identified data for demos
