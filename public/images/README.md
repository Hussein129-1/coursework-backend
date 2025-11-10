# Lesson Images

This folder contains images for the after-school classes.

## Usage

Place lesson images in this directory. They will be served statically by the Express.js server.

Images can be accessed at: `http://localhost:3000/images/[filename]`

For example:
- `math.jpg` → `http://localhost:3000/images/math.jpg`
- `science.png` → `http://localhost:3000/images/science.png`

## Naming Convention

Use descriptive names that match your lesson subjects:
- `mathematics.jpg`
- `english.jpg`
- `science.jpg`
- `programming.jpg`
- etc.

## Supported Formats

- JPG/JPEG
- PNG
- GIF
- SVG

## Note for Development

The static file middleware in `server.js` will automatically serve these files and return a 404 error if an image doesn't exist.
