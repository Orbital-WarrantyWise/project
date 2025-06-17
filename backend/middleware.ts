import type {Request, Response, NextFunction } from 'express'
import supabase from './client';

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  console.log("Recieved Header", req.headers); // Note: All header keys are converted to lowercase
  const { data, error } = await supabase.auth.getUser(req.header("supabase_access_token")); // Supabase returns error not err lol
  console.log("Supabase Response", data, error);
  if (error) {
    res.status(401).json({
      "success": false,
      "error": error
    });
  } else {
    req.middleware_data = {
      "user_id": data["user"]["id"]
    };
    next();
  }
}
