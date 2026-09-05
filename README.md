# Fourier Lab

Fourier Lab is an interactive, browser-based teaching tool for exploring the two-dimensional Fourier transform in image processing. It connects Fourier basis functions, frequency spectra, image synthesis, and frequency-domain filtering through direct visual interaction.

The application is written in plain HTML, CSS, and JavaScript. It runs locally without a build step or external dependencies.

## Features

### Basis Function Explorer

- Adjust horizontal frequency `u` and vertical frequency `v`.
- Visualize the real and imaginary components of a 2D Fourier basis function.
- Click or drag on the frequency plane to select a frequency.
- Observe radial frequency, stripe orientation, and conjugate-frequency relationships.

### Spectrum Mixer

- Add Fourier coefficients directly to an editable spectrum.
- Select either point of a pair and edit its real and imaginary parts; magnitude `A = |F(u,v)|` is calculated automatically.
- Automatically create conjugate pairs for real-valued reconstruction, with one color per pair and large/small representative/conjugate dots.
- Inspect the right-hand coefficient by default; for points on the vertical axis, inspect the upper point.
- Compare center-row and center-column signals beside the reconstructed image.
- Combine multiple basis images into stripes, grids, and more complex textures.
- Animate the image synthesis process one coefficient pair at a time.

### Filter Studio

- Upload an image and convert it to a centered, square `256 x 256` grayscale image.
- Compute and display its 2D FFT magnitude spectrum.
- Choose low-pass, high-pass, or band-pass in the first row, then Ideal or Gaussian in the second row (six combinations).
- Adjust the cutoff frequency interactively.
- Compare hard frequency cutoffs, smooth Gaussian transitions, ringing, smoothing, and edge responses.

## Run locally

Keep the following three files in the same directory:

```text
Fourier_Transform/
|-- index.html
|-- styles.css
`-- app.js
```

Open `index.html` in a modern browser. No installation or internet connection is required.

For a local HTTP server, run one of the following commands from the project directory:

```bash
python -m http.server 4173
```

Then visit [http://localhost:4173](http://localhost:4173).

## How to demonstrate the project

Open the experiment menu by clicking **Σ Fourier Lab** in the upper left.

1. Use **Basis Function Explorer** to show how `u` and `v` control stripe density and direction.
2. Switch between the real and imaginary components of the complex basis function.
3. Use **Spectrum Mixer** to add several coefficient pairs and synthesize an image.
4. Open **Filter Studio**, upload an image, and inspect its spectrum.
5. Compare low-pass and high-pass filtering.
6. Compare Ideal and Gaussian filters to discuss hard cutoffs, smooth transitions, and ringing.

## Technical notes

- Basis and synthesis demonstrations use small grids to keep every interaction immediate.
- Mixer coefficients follow the DFT convention: a complex coefficient `F(u,v) = a + ib` and its conjugate `a - ib` contribute `2[a cos θ - b sin θ] / (MN)`, where `θ = 2π(ux/M + vy/N)` and `A = sqrt(a² + b²)`. Image and cross sections share an automatically normalized display scale.
- Gaussian band-pass is the difference of two Gaussian low-pass masks with standard deviations `D₀` and `0.55 D₀`; Ideal band-pass retains `0.55 D₀ ≤ D ≤ D₀`.
- Filter Studio uses a radix-2 2D FFT at `256 x 256` resolution.
- Uploaded images are converted to grayscale and center-cropped to a square before processing.
- All computation runs locally in the browser; uploaded images are not sent anywhere.

## Project structure

```text
.
|-- index.html      # Interface and page structure
|-- styles.css      # Visual design and responsive layout
|-- app.js          # Fourier mathematics, FFT, rendering, and interactions
|-- README.md
|-- LICENSE
|-- .gitignore
`-- .gitattributes
```

## Browser support

Use a recent version of Chrome, Edge, Firefox, or Safari. JavaScript and the Canvas API must be enabled.

## License

This project is available under the [MIT License](LICENSE).


## Verification

Run `node tests/revisions.cjs` for conjugate-pair selection, DFT coefficient consistency, and all six filter responses. Run `node --check app.js` for JavaScript syntax.
