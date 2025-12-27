# Weblog

This blog is built using [Observable Framework](https://observablehq.com/framework).

## Getting Started

To preview the blog locally with interactive cells:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the local preview server:**
    ```bash
    npm run dev
    ```
    This will open the site in your browser (usually at http://localhost:3000). The server supports hot reloading, so changes to files in `src/` will appear instantly.

## Building for Production

To build the static site:

```bash
npm run build
```

The output will be in the `dist/` directory.

## Project Structure

- `src/`: Contains the markdown source files and assets.
- `observablehq.config.js`: Configuration for the site (title, pages, etc.).