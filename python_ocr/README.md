# Python OCR

## Local

1. Setup virtual environment

```
python -m venv warrantywise_venv
```

2. Activate virtual environment
- Windows: `warrantywise_venv\Scripts\Activate.ps1`
- Unix: `source warrantywise_venv/bin/activate`

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Run Python OCR flask app

```bash
python app.py
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
