import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_PROMPT_LENGTH = 4000;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Image generation is not configured. Add OPENAI_API_KEY to the server environment." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Please send a valid form request." }, { status: 400 });
  }

  const promptValue = formData.get("prompt");
  if (typeof promptValue !== "string" || !promptValue.trim()) {
    return NextResponse.json({ error: "Enter a prompt before generating an image." }, { status: 400 });
  }
  const prompt = promptValue.trim();
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: `Prompts must be ${MAX_PROMPT_LENGTH} characters or fewer.` }, { status: 400 });
  }

  const imageValue = formData.get("image");
  if (imageValue !== null && !(imageValue instanceof File)) {
    return NextResponse.json({ error: "The reference image is invalid." }, { status: 400 });
  }
  if (imageValue instanceof File) {
    if (!ALLOWED_IMAGE_TYPES.has(imageValue.type)) {
      return NextResponse.json({ error: "Use a PNG, JPEG, or WEBP reference image." }, { status: 400 });
    }
    if (imageValue.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Reference images must be 10 MB or smaller." }, { status: 413 });
    }
  }

  try {
    const openai = new OpenAI({ apiKey });
    const result = imageValue instanceof File
      ? await openai.images.edit({
          model: "gpt-image-1",
          image: await toFile(await imageValue.arrayBuffer(), imageValue.name || "reference-image", { type: imageValue.type }),
          prompt,
          size: "1024x1024",
        })
      : await openai.images.generate({
          model: "gpt-image-1",
          prompt,
          n: 1,
          size: "1024x1024",
        });

    const imageBase64 = result.data?.[0]?.b64_json;
    if (!imageBase64) {
      console.error("OpenAI image response did not contain image data.");
      return NextResponse.json({ error: "OpenAI returned no image. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ image: `data:image/png;base64,${imageBase64}` });
  } catch (error) {
    console.error("OpenAI image request failed:", error);
    return NextResponse.json({ error: "OpenAI could not complete the image request. Check your API account and try again." }, { status: 502 });
  }
}
