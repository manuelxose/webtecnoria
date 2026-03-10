import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { env } from "../config/env.js";

const GooglePayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
});

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export type GoogleIdentity = {
  sub: string;
  email: string;
  name?: string;
  emailVerified: boolean;
};

export async function verifyGoogleCredential(
  credential: string
): Promise<GoogleIdentity> {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const parsed = GooglePayloadSchema.safeParse(ticket.getPayload());
  if (!parsed.success) {
    throw new Error("Invalid Google token payload");
  }

  return {
    sub: parsed.data.sub,
    email: parsed.data.email,
    name: parsed.data.name,
    emailVerified: parsed.data.email_verified !== false,
  };
}
