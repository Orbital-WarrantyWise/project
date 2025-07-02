declare namespace Express {
  interface Request {
    middleware_data: { user_id: string };
  }
}
