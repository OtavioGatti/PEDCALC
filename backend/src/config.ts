import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SYNC_API_TOKEN: z.string().min(16, "SYNC_API_TOKEN deve ter pelo menos 16 caracteres"),
  NOTION_TOKEN: z.string().min(1),
  NOTION_DATABASE_ID: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

export const config = envSchema.parse(process.env);
