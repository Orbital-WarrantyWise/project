# Backend

## Local

1. Create an `.env` file containing the various URLs and API Keys (please refer to `.env.example`)

2. Install dependencies

```bash
npm install
```

3. Run backend

```bash
npm start
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

4. Go to the "Settings" tab of your Backend Project on Vercel, click "Environment Variables" in the sidebar, and upload the `.env` file (remembering to change the URLs accordingly)

## Supabase

To generate types for TypeScript support:

1. Login to Supabase

```bash
npx supabase login
```

2. Generate types

```bash
npx supabase gen types typescript --project-id <supabase_project_id> > database.types.ts
```
