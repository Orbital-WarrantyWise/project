import type { Request, Response, NextFunction } from 'express';
import supabase from './client';
import { StatusCodes } from 'http-status-codes';

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  console.log('Received Header', req.headers); // Note: All header keys are converted to lowercase
  const { data, error } = await supabase.auth.getUser(req.header('supabase_access_token'));
  console.log('Supabase Response', data, error);
  if (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: error,
    });
  } else {
    req.middleware_data = { user_id: data['user']['id'] };
    next();
  }
}
