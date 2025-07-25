import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import supabase from '../client';

const InviteController = {
  invite: async (req: Request, res: Response) => {
    console.log('Received Body', req.body);
    const { email, role, organisationId } = req.body;
    const { data, error } = await supabase.from('users').select().eq('email', email).maybeSingle();
    if (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error,
      });
    } else {
      if (data) {
        // TODO: Handle invitation by email, with custom route and custom table storing tokens
        /*
          CREATE TABLE IF NOT EXISTS stories (
          id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at timestamp with time zone DEFAULT timezone('utc' :: text, now()) NOT NULL,
          content text NOT NULL
          ); 

          Create a Policy for SELECT operations: Define a policy that restricts SELECT access to rows based on their created_at timestamp. This effectively makes older rows "disappear" from queries.
        */

        const { error } = await supabase.from('organisations_on_users').insert({
          user_id: data.user_id,
          organisation_id: organisationId,
          role: role,
        });
        if (error) {
          if (error.code === '23505') {
            res.status(StatusCodes.CONFLICT).json({
              success: false,
              error: 'User is already a member of your organisation',
            });
          } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              success: false,
              error: 'Unknown error occurred',
            });
          }
          return;
        }
      }
      res.status(StatusCodes.OK).json({
        success: false,
      });
    }
  },
};

export default InviteController;
