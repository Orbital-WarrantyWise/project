import express from 'express';
import cors from 'cors';
import { authRequired } from './middleware';
import { router as AuthRouter } from './routes/auth';
import { router as WarrantyRouter } from './routes';

declare module 'express-serve-static-core' {
  interface Request {
    middleware_data: { user_id: string };
  }
}

const app = express();
const port = 8000;

app.use(cors({ origin: process.env.FRONTEND_BASE_URL })); // Prevent CORS errors
app.use(express.json()); // Ensure req recieved is in json

app.use('/auth', AuthRouter);
app.use('/warranty', authRequired, WarrantyRouter);

app.get('/healthcheck', (req, res) => {
  res.json({
    success: true,
    message: `Backend is up! Server time is ${new Date().toString()}`,
  });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
