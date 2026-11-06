# Graphic Staging Animation — hosted image-to-3D integration

This release adds an **actual AI image-to-3D workflow**, backed by the Meshy image-to-3D API, and loads generated GLB meshes into the existing Three.js viewer/animation workspace. It does **not** claim to run an image-to-3D AI model in the browser.

## Setup

1. Deploy `index.html` and `.nojekyll` to your GitHub Pages repo.
2. Deploy the separate `backend/` directory to a Node.js 20+ server (Render, Railway, a VPS, etc.). GitHub Pages cannot run this server.
3. Set backend environment variables `MESHY_API_KEY` (secret, never in GitHub or browser) and `ALLOWED_ORIGIN` (your exact GitHub Pages origin, e.g. `https://gabrielsnowboy.github.io`). Set `PORT` if your host requires it.
4. Run `npm start` from the backend folder; configure an HTTPS public URL with your hosting provider.
5. In the app's **AI image → true 3D** section, enter the backend URL, choose a PNG/JPEG/WebP (under 8 MB), and select **Generate real 3D model**.
6. Wait for the generation task; when ready, the GLB imports automatically. The image is transmitted to your backend and Meshy; this is not a private offline operation.

## Costs and limits

Meshy API access is a separate paid/credit-based service. This application does not provide a free AI model or free generation credits. Your server hosting may also cost money. Generated GLB files may not have a skeleton and cannot be posed bone-by-bone until rigged. Single-image reconstructions may still have imperfect hidden geometry.

## Security before public release

The provided backend is intended for personal development. **Do not deploy an unauthenticated public generation endpoint with a paid API key.** `ALLOWED_ORIGIN` and CORS are browser controls, not authentication: anyone can send requests directly. Add user authentication, server-side quotas/rate limits, spend limits, and logging before making the service public. The in-memory job registry is lost on server restart; use a persistent store for production. Restrict egress and validate provider download hosts in a production deployment.

## Verification

Syntax checks only. No live Meshy request or interactive browser test has been performed; API request fields and returned model URLs should be verified against your provider account's current documentation before deployment.
