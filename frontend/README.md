# Frontend

## Local

1. Create an `.env` file containing the various URLs and API Keys (please refer to `.env.example`)

2. Install dependencies

```bash
pnpm install
```

3. Run frontend

```bash
npx expo start
```

## Vercel

1. Install Vercel

```bash
pnpm i -g vercel
```

2. Login to Vercel

```bash
vercel login
```

3. Deploy to Production on Vercel (feel free to use all default settings)

```bash
vercel --prod
```

4. Go to the "Settings" tab of your Frontend Project on Vercel, click "Environment Variables" in the sidebar, and upload the `.env` file (remembering to change the URLs accordingly)
