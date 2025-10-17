import z from 'zod';

export const contributionFormSchema = z.object({
  contributions: z.array(
    z.object({
      id: z.string().trim(),
      quantity: z
        .number()
        .positive({ message: 'Bitte gib an, welche Menge du retten möchtest' }),
      foodId: z.string().trim().uuid(),
      title: z
        .string()
        .trim()
        .min(1, { message: 'Bitte gib einen Titel an' })
        .max(50, {
          message: 'Dieses Feld darf nicht mehr als 50 Zeichen lang sein',
        }),
      categoryId: z
        .uuid()
        .trim()
        .min(1, { message: 'Bitte wähle eine Kategorie aus' }),
      originId: z
        .uuid()
        .trim()
        .min(1, { message: 'Bitte wähle ein Herkunft aus' }),
      companyId: z.uuid().trim().nullable(),
      company: z.string().trim().nullable(),
      cool: z.boolean(),
      shelfLife: z
        .date()
        .refine((date) => date === null || date > new Date(), {
          message: 'Haltbarkeit darf nicht in der Vergangenheit liegen',
        })
        .nullable(),
      allergens: z
        .string()
        .trim()
        .max(100, {
          message: 'Dieses Feld darf nicht mehr als 100 Zeichen lang sein',
        })
        .nullable(),
      comment: z
        .string()
        .trim()
        .max(400, {
          message: 'Dieses Feld darf nicht mehr als 400 Zeichen lang sein',
        })
        .nullable(),
    }),
  ),
  // Optional configuration for different submission contexts
  config: z.object({
    fairteilerId: z.string(),
    successRedirect: z.string().optional(),
    revalidatePaths: z.array(z.string()).optional(),
    context: z.enum(['fairteiler', 'user', 'admin']).optional(),
  }),
});

export type ContributionFormValues = z.infer<typeof contributionFormSchema>;

export const contributionEditSchema = z.object({
  checkinId: z.string(),
  prevValue: z.string(),
  newValue: z.string(),
  field: z.string(),
});

export const editContributionFormSchema = z.object({
  checkinId: z.string().trim(),
  quantity: z
    .number()
    .positive({ message: 'Die gerettete Menge darf nicht 0 betragen' }),
});
