# Frontend

## Local

1. Install dependencies

```bash
npm install
```

2. Run frontend

```bash
npx expo start
```

## Vercel

1. Install Vercel
```bash
npm i -g vercel
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
