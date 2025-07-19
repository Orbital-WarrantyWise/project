import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { getOCR,getRecommendation } from '../gemini';

const AIController = {
  recommendation: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    const { data, error } = await getRecommendation(req.body);
    console.log('Gemini Response', data, error);
    if (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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

  ocr: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    const { data, error } = await getOCR(req.body);
    console.log('Gemini Response', data, error);
    if (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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

export default AIController;
