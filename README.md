# Graphic Staging Animation

Turn a picture of a character into a posable 3D model you can animate frame by frame, right in your browser. Nothing is uploaded anywhere: your pictures, audio and projects stay on your own computer.

## What it does

1. **Import** a full-body front picture of your character (required). You can also add a back view, a face close-up, and more reference pictures such as a side view or other poses. Turnaround sheets with several views in one picture are split automatically. You can also import a 3D model instead (FBX, OBJ, glTF/GLB, STL, Alembic, USD/USDZ, Collada, PLY).
2. **Model:** the app rebuilds the character as a solid 3D model with a front, sides and back. Spin it round to check every side, and adjust body depth, head depth, head shape and how the back is filled in. The model check shows any part of the picture the model is missing. For human characters with a side view, the body and head are fitted to that side view automatically.
3. **Rig:** check the joints the app placed (neck, shoulders, elbows, wrists, hips, knees, ankles, plus an optional tail) and drag any that are off. Eyes and mouth are found automatically for facial expressions and lip-sync.
4. **Animate:** pose the character by dragging body parts, set facial expressions, and take a snapshot for each frame of your animation. Import an audio file to have the mouth move with the sound, frame by frame.

## Export

- A single frame as PNG
- All frames as a ZIP of PNGs
- A video (WebM)
- A project file (JSON) you can open again later

Background colours (green, blue, magenta, black, white, or transparent) make masking easy in a video editor.

## Running it

It's a single web page, so there's nothing to install or build.

- **Use it locally:** download `index.html` and open it in Chrome, Edge or Firefox.
- **Host it on GitHub Pages:**
  1. Create a new repository on GitHub and upload `index.html`, `README.md` and `.nojekyll`.
  2. In the repository, go to **Settings → Pages**.
  3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, then click **Save**.
  4. After a minute or two your app is live at `https://<your-username>.github.io/<repository-name>/`.

## Requirements

- A modern browser with WebGL (Chrome, Edge, Firefox or Safari, on desktop or mobile).
- An internet connection the first time the page loads. three.js, JSZip and the fonts come from public CDNs (cdnjs, jsDelivr and Google Fonts).
- A graphics-card setting in the app lets you pick the high-performance GPU on computers that have two.

## Browser-only art-style rendering upgrade

Open **Graphics & speed** in the animation inspector to choose **Original**, **Anime**, **Cartoon**, or **2D look**. Anime and cartoon modes posterize the light response while preserving imported image texture detail, transparency, existing model shape and rig. Adjust **Anime ink edge shading**, **Outline strength**, and **Cel shading bands** to taste. Settings persist in browser local storage.

This is a shader-based stylization of the current geometry. It does **not** infer a complete 3D model from a single image or create a 2D illustration. No paid AI API is required. The page still needs access to its existing Three.js CDN resources on first load.
