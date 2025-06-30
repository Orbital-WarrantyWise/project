import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import supabase from '../client';

const WarrantyController = {
  getWarranty: async (req: Request, res: Response) => {
    const user_id = req.middleware_data.user_id; // Get user_id obtained from middleware
    const { data, error } = await supabase.from('warranties').select().eq('user_id', user_id);
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

  createWarranty: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    const user_id = req.middleware_data.user_id; // Get user_id obtained from middleware
    const { error } = await supabase.from('warranties').insert({ ...req.body, user_id });
    console.log('Supabase Response', error);
    if (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: error,
      });
    } else {
      res.status(StatusCodes.OK).json({
        success: true,
      });
    }
  },

  editWarranty: async (req: Request, res: Response) => {
    console.log("Received Body', req.body");
    const user_id = req.middleware_data.user_id; // Get user_id obtained from middleware
    const id = parseInt(req.params['warrantyId']);
    const { error } = await supabase
      .from('warranties')
      .update({
        ...req.body,
        user_id,
      })
      .eq('id', id);
    console.log('Supabase Response', error);
    if (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: error,
      });
    } else {
      res.status(StatusCodes.OK).json({
        success: true,
      });
    }
  },

  searchWarranty: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    const user_id = req.middleware_data.user_id; // Inject user_id obtained from middleware
    const { product_name }: { product_name: string } = req.body;
    const { data, error } = await supabase
      .from('warranties')
      .select()
      .eq('user_id', user_id)
      .ilike('product_name', `%${product_name}%`);
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

export default WarrantyController;
