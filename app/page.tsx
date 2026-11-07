"use client";

import { useEffect, useState } from "react";

type GenerateResponse = { image?: string; error?: string };

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!referenceImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(referenceImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [referenceImage]);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setOutput(null);

    const formData = new FormData();
    formData.set("prompt", prompt.trim());
    if (referenceImage) formData.set("image", referenceImage);

    try {
      const response = await fetch("/api/generate", { method: "POST", body: formData });
      const data = (await response.json()) as GenerateResponse;
      if (!response.ok || !data.image) {
        throw new Error(data.error || "Image generation failed. Please try again.");
      }
      setOutput(data.image);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="AI Studio Pro home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>AI Studio <span className="brand-light">Pro</span></span>
        </a>
        <span className="status-pill"><span className="status-dot" /> OpenAI image generation</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> YOUR CREATIVE WORKSPACE</div>
        <h1>Make your ideas<br /><span>impossible to ignore.</span></h1>
        <p>Describe the image you imagine. Generate a new image or upload one to edit it with AI.</p>
      </section>

      <section className="studio-card" aria-label="Image generator">
        <div className="card-heading">
          <div>
            <span className="section-label">CREATE</span>
            <h2>Image studio</h2>
          </div>
          <span className="model-chip">GPT Image</span>
        </div>

        <form onSubmit={handleGenerate}>
          <label className="field-label" htmlFor="prompt">Your prompt</label>
          <textarea
            id="prompt"
            rows={4}
            maxLength={4000}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="A cinematic portrait of an ancient explorer in a rain-soaked neon city, dramatic lighting, rich details..."
            required
          />
          <div className="field-meta"><span>Be specific about subject, style, lighting, and composition.</span><span>{prompt.length}/4000</span></div>

          <label className="field-label upload-label" htmlFor="reference-image">Reference image <span className="optional">OPTIONAL · EDIT MODE</span></label>
          <label className="upload-box" htmlFor="reference-image">
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="preview-image" src={previewUrl} alt="Selected reference" />
                <span className="upload-copy"><strong>{referenceImage?.name}</strong><span>Click to choose a different image</span></span>
              </>
            ) : (
              <>
                <span className="upload-icon" aria-hidden="true">↥</span>
                <span className="upload-copy"><strong>Upload a reference image</strong><span>PNG, JPEG, or WEBP · up to 10 MB</span></span>
                <span className="browse-button">Browse files</span>
              </>
            )}
          </label>
          <input
            id="reference-image"
            className="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setReferenceImage(file);
              event.target.value = "";
            }}
          />
          {referenceImage && (
            <button type="button" className="remove-image" onClick={() => setReferenceImage(null)}>Remove reference image</button>
          )}

          {error && <div className="error-message" role="alert">{error}</div>}

          <button className="generate-button" type="submit" disabled={loading || !prompt.trim()}>
            {loading ? <><span className="spinner" /> Creating your image…</> : <><span aria-hidden="true">✦</span> {referenceImage ? "Edit image" : "Generate image"}<span className="button-arrow" aria-hidden="true">→</span></>}
          </button>
          <p className="privacy-note">Your API key stays on the server. Image generation may incur OpenAI API charges.</p>
        </form>
      </section>

      {output && (
        <section className="result-card" aria-live="polite">
          <div className="result-heading"><div><span className="section-label">YOUR RESULT</span><h2>Created for you</h2></div><a className="download-button" href={output} download="ai-studio-image.png">↓ <span>Download</span></a></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="result-image" src={output} alt={`AI-generated image for: ${prompt}`} />
        </section>
      )}

      <footer className="footer"><span>AI Studio Pro</span><span>Powered by OpenAI</span></footer>
    </main>
  );
}
