# Public Assets

Place your static assets here, such as:

- Background images for the login page
- Logo images
- Other static files

## Background Image

To use a custom background image for the login page:

1. Place your image in this `public` folder (e.g., `building-background.jpg`)
2. Update `src/pages/Login.tsx` and change the backgroundImage URL:
   ```tsx
   backgroundImage: 'url(/building-background.jpg)',
   ```

The current implementation uses a placeholder image from Unsplash. Replace it with your own image for the Kulim Municipal Council building.

