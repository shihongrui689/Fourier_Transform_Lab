# Fourier Lab

Fourier Lab is an interactive, browser-based teaching tool for exploring the two-dimensional Fourier transform in image processing. It connects Fourier basis functions, frequency spectra, image synthesis, and frequency-domain filtering through direct visual interaction.

The application is written in plain HTML, CSS, and JavaScript. It runs locally without a build step or external dependencies.

## Features

### Basis Function Explorer

- Adjust horizontal frequency `u`, vertical frequency `v`, and phase.
- Visualize the real, imaginary, and phase components of a 2D Fourier basis function.
- Click or drag on the frequency plane to select a frequency.
- Observe radial frequency, stripe orientation, and conjugate-frequency relationships.

### Spectrum Mixer

- Add Fourier coefficients directly to an editable spectrum.
- Adjust coefficient amplitude and phase.
- Automatically create conjugate pairs for real-valued reconstruction.
- Combine multiple basis images into stripes, grids, and more complex textures.
- Animate the image synthesis process one coefficient pair at a time.

### Filter Studio

- Upload an image and convert it to a centered, square `256 x 256` grayscale image.
- Compute and display its 2D FFT magnitude spectrum.
- Apply Ideal and Gaussian low-pass or high-pass filters.
- Apply a band-pass filter.
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

1. Use **Basis Function Explorer** to show how `u` and `v` control stripe density and direction.
2. Switch between the real and imaginary components of the complex basis function.
3. Use **Spectrum Mixer** to add several coefficient pairs and synthesize an image.
4. Open **Filter Studio**, upload an image, and inspect its spectrum.
5. Compare low-pass and high-pass filtering.
6. Compare Ideal and Gaussian filters to discuss hard cutoffs, smooth transitions, and ringing.

## Technical notes

- Basis and synthesis demonstrations use small grids to keep every interaction immediate.
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

