This repo contains a simple UI for searching Search the Rekor public transparency log.

https://search.sigstore.dev/

![Rekor UI Screenshot](assets/screenshot2.png)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy

The app is based on [Next.JS](https://nextjs.org/) and is automatically built & deployed to GitHub Pages when pushing to the `main` branch.

## Internal Server Configuration

This app supports overriding of the default rekor server instance for those running private instances of the the sigstore stack.
Create a `.env.local` file at the root and include in it this environment variable

```properties
NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN=https://privaterekor.sigstore.dev
```
