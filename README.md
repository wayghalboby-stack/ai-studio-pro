# AI Studio Pro

A Next.js app for generating new images and editing uploaded reference images with OpenAI's Images API.

## Run locally

1. Install Node.js 20.9 or newer.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env.local` and set your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_actual_api_key
   ```

4. Start the development server: `npm run dev`.
5. Open http://localhost:3000.

The API key is read only by the server route and must never be exposed in a `NEXT_PUBLIC_` variable. Image API usage can incur charges; set billing and usage limits in your OpenAI account.

## Integration details

- `POST /api/generate` accepts `multipart/form-data` with a required `prompt` and an optional `image` file.
- Without an image, the server calls OpenAI image generation. With an image, it calls image editing.
- The current model is `gpt-image-1`; generated image data is returned to the browser as a PNG data URL.
- Reference images are limited to PNG, JPEG, or WEBP and 10 MB.
- This project implements image generation/editing only. The video control in the original mockup used a sample clip, not an OpenAI video API integration, so it is intentionally not presented as working functionality.

## Checks

- `npm run typecheck`
- `npm run build`
