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
\n\n## Geometry fixes (November 2026)\n\n- Independent rear mesh for every part rather than reusing the front surface.\n- Generated helmet/hair back uses a simplified color fill when no rear reference exists.\n- Narrower, side-colour edge ribbon to reduce the vertical stripe at the front/back join.\n- Increased foot depth to reduce paper-thin skates.\n- The image-only workflow is depth-based 2.5D reconstruction, not complete AI 3D generation. A rear view is needed for accurate back details.\n

## Character-aware volume reconstruction

The model builder now measures each isolated body-part silhouette row by row and creates smooth superellipse cross-sections. Head, torso, limbs and skates use different front/back depth profiles. The torso has a softer belly bulge; skates have a fuller forward-facing volume. The rear helmet is color-estimated without repeating the face.

This is still a **single-image approximation**, not AI 3D reconstruction. It cannot infer hidden jersey numbers, helmet vents, facial anatomy, or accurately recreate the back without a separate rear reference. For best results, import a clean transparent PNG and supply back/side references when available.


## Compact interface update

- Desktop workspace now fits the viewport with a scrolling inspector and a bounded timeline.
- A Hide controls / Show controls button provides a larger animation preview on desktop.
- Responsive spacing, controls and stage sizing improve use on smaller windows and phones.
- Existing modeling and animation functions are retained.
