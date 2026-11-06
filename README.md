# Graphic Staging Animation — free local AI image-to-3D

This package replaces the paid Meshy workflow with a **local Hunyuan3D-2 API** and a **Python standard-library bridge**. GitHub Pages remains the frontend. No paid API key is required.

## Windows setup

1. Install Python 3.10–3.12 and Git. Install a compatible NVIDIA GPU driver and CUDA/PyTorch environment as directed by the Hunyuan3D repository. A suitable GPU is strongly recommended.
2. Follow the official Hunyuan3D-2 instructions at https://github.com/Tencent-Hunyuan/Hunyuan3D-2 to install its Python dependencies and model weights. Use the installation commands appropriate to your GPU. Model downloads are large.
3. From the Hunyuan3D-2 directory, start its local API (in the model's activated Python environment):

   `python api_server.py --host 127.0.0.1 --port 8080`

   **Important:** Verify the version of Hunyuan3D you installed supports `POST /generate` with JSON `{"image":"<base64>"}` returning a binary GLB. The official Hunyuan3D-2 API documents this endpoint. If its API differs, adapt `run_job` in `local_bridge.py`.
4. Start the included `start-bridge.bat` (or run `python local_bridge.py`). It listens on `127.0.0.1:8787` and calls the Hunyuan API on `127.0.0.1:8080`.
5. Upload this `index.html` to your GitHub Pages repository and open your app. In the **Local AI image → true 3D** panel, set the bridge URL to `http://127.0.0.1:8787`, choose your image and click **Generate real 3D model**.
6. After generation finishes, the GLB is imported into the animation viewer automatically. Generated GLBs are also saved to `generated-models/` on your computer.

## Hardware and limitations

- GitHub Pages cannot run the model; both the bridge and Hunyuan must be running on **the same computer** where you open the app.
- For reference, the Hunyuan3D-2.1 project reports about **10 GB VRAM for shape generation**, and substantially more for texturing. Hunyuan3D-2 model requirements depend on the variant; consult its official README.
- Single-image generation estimates unseen surfaces. Separated limbs, back details and faithful anime textures are **not guaranteed**. Most generated meshes are not rigged. Use a clean transparent-background full-body image with arms and legs visibly separated for better results.
- The bridge accepts requests from GitHub Pages and binds only to loopback. Don't expose port 8787 or the Hunyuan API to the public internet. It has no user authentication. Do not run untrusted sites while it is active.
- Your image is processed locally, subject to any external downloads you separately authorize during installation.
- Browser security settings can restrict HTTPS GitHub Pages access to localhost. If blocked, run the frontend on `http://127.0.0.1` using `python -m http.server 8000` and open `http://127.0.0.1:8000` instead.

## Testing

Visit http://127.0.0.1:8787/api/health to check the bridge. A healthy bridge does **not** mean the GPU model is installed or running; the first real generation checks that connection.

## Files

- `index.html`: upgraded frontend
- `local_bridge.py`: local API connector and GLB storage
- `start-bridge.bat`: Windows bridge launcher
- `.nojekyll`: GitHub Pages marker

## For other users: using the GitHub Pages app

**You can open and use the hosted app without installing Python, Hunyuan3D, or the local bridge.** Its browser-based image import, editing, preview, and available animation tools run in the website. You can also import an existing supported 3D model (such as a `.glb`) without running AI generation. Some features and file-format support depend on your browser and the version of the app.

**The “Local AI image → true 3D” feature is optional and requires setup on the computer performing generation.** GitHub Pages hosts the interface only; it does not provide a shared AI server. If the local AI server is not installed or running, the rest of the app can still be used, but that AI-generation feature will not work.

### Want to generate AI 3D models on your own Windows PC?

1. Check your NVIDIA GPU and dedicated video memory in Windows Task Manager → Performance → GPU, or run `nvidia-smi` in PowerShell. A compatible CUDA-capable NVIDIA GPU with sufficient VRAM is recommended. **12 GB VRAM is a reasonable starting point for shape-only generation with a smaller model**, but does not guarantee success with every model or texture pipeline.
2. Install Python and Git. Check the current, official setup and supported versions at https://github.com/Tencent-Hunyuan/Hunyuan3D-2. The model's installation requirements and Windows compatibility may change; follow the official instructions for your hardware rather than assuming a single CUDA/PyTorch combination works everywhere.
3. Clone and install Hunyuan3D-2 according to its instructions, and launch its local API on port `8080`. For versions supporting the arguments below, an example is:

   ```powershell
   cd C:\AI\Hunyuan3D-2
   .\.venv\Scripts\Activate.ps1
   python api_server.py --host 127.0.0.1 --port 8080 --model_path tencent/Hunyuan3D-2mini
   ```

   The exact flags/model name may differ by installed version. Consult `python api_server.py --help` and the official README if the command fails. Keep this terminal open.
4. Download/extract the **full local-AI upgrade package** (not just the website's `index.html`). On the same computer, run `start-bridge.bat` or `python local_bridge.py`. This bridge runs on `http://127.0.0.1:8787`. Keep it running alongside Hunyuan3D.
5. Visit `http://127.0.0.1:8787/api/health` to verify that the bridge is responding. **This only checks the bridge, not the AI model.**
6. Open the hosted Graphic Staging Animation website in a browser **on that same computer**. In **Local AI image → true 3D**, use bridge URL `http://127.0.0.1:8787`, select a character image, and generate. A successful request imports a GLB and saves a copy to `generated-models/`.

### On a second device

- **To edit or animate:** Open the GitHub Pages site normally. No AI installation is necessary. Transfer or import any previously generated GLB files as needed.
- **To generate new AI models independently:** Install the AI model and bridge on that device, if its hardware supports them.
- **To use one computer's AI from other devices:** This package does **not** provide remote sharing. `127.0.0.1` always means the device you are currently using. A separate, authenticated, securely configured server connection would be required; do not simply expose the unauthenticated local bridge to the internet.

### Troubleshooting

| Symptom | What to check |
| --- | --- |
| Website opens, but AI generation is unavailable | Start both the Hunyuan3D API and the local bridge on the same computer. |
| `CUDA: False` or no NVIDIA GPU detected | Confirm GPU driver, compatible CUDA-enabled PyTorch, and the correct active Python environment. |
| Out-of-memory error | Try a smaller shape-only model or reduce memory use; texturing often requires more VRAM. |
| Bridge health works, but generation fails | Verify Hunyuan is running on port 8080 and supports the `/generate` request/response expected by `local_bridge.py`. |
| Browser refuses to connect to localhost | Check browser local-network permissions. As a fallback, serve the frontend locally with `python -m http.server 8000` and open `http://127.0.0.1:8000`. |
| Mesh is not poseable | AI-generated GLB geometry is not necessarily rigged. Rigging and limb separation require additional processing. |

**Privacy and costs:** The local AI pipeline does not require a paid image-to-3D API, but model downloads, electricity, storage, and hardware are your responsibility. The local bridge is not designed as a public, multi-user service. Browser-local workspaces are not automatically synced between devices, and files committed to a public GitHub repository are publicly accessible.


## Compact interface

The workspace now defaults to **Compact view** on desktop: the stage, inspector, and frame timeline share the available browser height, with independent scrolling inside the inspector and timeline rather than requiring page scrolling. Use the **Compact view / Roomy view** button in the top toolbar to switch layouts. Your choice is remembered in this browser. On small screens the stage and controls remain stacked for touch usability. Browser zoom (Ctrl + minus) can provide more room on very small displays.
