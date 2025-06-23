import type { Request, Response } from 'express';
import supabase from '../client';
import { StatusCodes } from 'http-status-codes';

const AuthController = {
  login: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    // TODO: Use zod to double check shape of req.body
    const { data, error } = await supabase.auth.signInWithPassword(req.body);
    console.log('Supabase Response', data, error);
    if (error) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: error,
      });
    } else {
      res.status(StatusCodes.OK).json({
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
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: error,
      });
    } else {
      res.status(StatusCodes.OK).json({
        success: true,
        data: data,
      });
    }
  },
};

export default AuthController;
