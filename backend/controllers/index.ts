import type { Request, Response } from 'express';
import supabase from '../client';

const WarrantyController = {
  createWarranty: async (req: Request, res: Response) => {
    console.log('Recieved Body', req.body);
    req.body.user_id = req.middleware_data.user_id; // Inject user_id obtained from middleware
    const { data, error } = await supabase.from('warranties').insert(req.body);
    console.log('Supabase Response', data, error);
    if (error) {
      res.status(400).json({
        success: false,
        error: error,
      });
    } else {
      res.status(200).json({
        success: true,
      });
    }
  },

  getWarranty: async (req: Request, res: Response) => {
    console.log('Recieved Body', req.body);
    const user_id = req.middleware_data.user_id; // Get user_id obtained from middleware
    const { data, error } = await supabase.from('warranties').select().eq('user_id', user_id);
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

export default WarrantyController;
