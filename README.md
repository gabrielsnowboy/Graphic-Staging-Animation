# Graphic Staging Animation — Editor Layout

This redesign uses a compact animation-editor layout inspired by the provided reference: gradient toolbar, vertical tool rail, character/upload sidebar, large central stage, right-hand inspector, and bottom timeline. No default character is loaded.

## Install

Replace the repository root `index.html` with the file in this package. Keep a backup of the existing file. The local AI bridge files are included unchanged from the previous appearance-fix package; run them locally as before.

## Getting started

On opening the site the stage is empty. Choose **Import a character** to add an image or choose **Upload > Import 3D model** to import an existing GLB/FBX. For local AI generation, go to **AI Create** (the Import page) and use the existing Hunyuan3D controls. The sample character is no longer loaded at startup.

## Notes

The redesign changes the interface, not the Hunyuan model, texturing capabilities, or rigging. No stock character assets are included. The app uses CDN-loaded Three.js and JSZip as before.

## Geometry-only AI model shading fix

Untextured, near-white GLB materials are shown using a neutral clay material with three-point lighting, so their depth and surface contours are visible. Authored textures, vertex colors, and colored materials are retained. The original imported textures are not recreated; to restore the source illustration's helmet, face and jersey colors, a separate AI texture pipeline is needed.

The application still opens with an empty stage and does not include a default character. The local AI connector and Windows launcher are unchanged.
