import { z } from 'zod'

/** Validates the `{ email }` body sent by the forgot-password page. */
export const forgotPasswordSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
})
