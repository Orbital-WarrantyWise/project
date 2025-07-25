import { Constants } from 'warrantywise-database/database.types';
import { z } from 'zod/v4';

const InviteSchema = {
  invite: z.object({
    email: z.email(),
    role: z.enum(Constants.public.Enums.OrganisationRole),
    organisationId: z.coerce.number().multipleOf(1),
  }),
};

export default InviteSchema;
