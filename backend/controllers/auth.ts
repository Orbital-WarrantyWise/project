import type { Request, Response } from 'express';
import supabase from '../client';

const AuthController = {
  login: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    const { data, error } = await supabase.auth.signInWithPassword(req.body);
    console.log('Supabase Response', data, error);
    if (error) {
      res.status(401).json({
        success: false,
        error: error,
      });
    } else {
      res.status(200).json({
        success: true,
        data: data,
      });
    }
  },

  register: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    const { data, error } = await supabase.auth.signUp(req.body);
    console.log('Supabase Response', data, error);
    if (error) {
      res.status(400).json({
        success: false,
        error: error,
      });
    } else {
      res.status(200).json({
        success: true,
        data: data,
      });
    }
  },
};

export default AuthController;
