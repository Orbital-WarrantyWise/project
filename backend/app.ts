import cors from 'cors';
import express from 'express';

import { authRequired } from './middleware';
import { router as AIRouter } from './routes/ai';
import { router as InviteRouter } from './routes/invite';

const app = express();
const port = 8000;

app.use(cors({ origin: process.env.FRONTEND_BASE_URL })); // Prevent CORS errors
app.use(express.json()); // Ensure req recieved is in json

app.use('/ai', authRequired, AIRouter);
app.use('/invite', authRequired, InviteRouter);

app.get('/healthcheck', (req, res) => {
  res.json({
    success: true,
    message: `Backend is up! Server time is ${new Date().toString()}`,
  });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
