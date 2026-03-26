import { createHmac } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAdmin, type AuthedRequest } from "../../auth/middleware.js";
import { env } from "../../config/env.js";

const router = Router();

const DEFAULT_AUCTORIO_RETURN_TO = "/studio/dashboard";

const LaunchSchema = z.object({
  workspace: z.string().trim().min(2).default("tecnoria"),
  returnTo: z.string().trim().optional(),
});

type LaunchTicketResponse = {
  launchId: string;
  tenantSlug: string;
  returnTo: string;
};

function resolveAuctorioReturnTo(value: string | null | undefined): string {
  const normalized = String(value || "").trim();
  return normalized.startsWith("/studio/") ? normalized : DEFAULT_AUCTORIO_RETURN_TO;
}

function getAllowedFirstPartyWorkspaces(): Set<string> {
  return new Set(
    env.AUCTORIO_FIRST_PARTY_WORKSPACES.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

function buildLaunchSignature(timestamp: string, rawBody: string): string {
  return createHmac("sha256", env.AUCTORIO_LAUNCH_SHARED_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest("base64url");
}

function buildPublicLaunchUrl(payload: LaunchTicketResponse): string {
  const launchUrl = new URL(env.AUCTORIO_PUBLIC_LOGIN_URL);
  launchUrl.searchParams.set("launch", payload.launchId);
  launchUrl.searchParams.set("workspace", payload.tenantSlug);
  launchUrl.searchParams.set("returnTo", resolveAuctorioReturnTo(payload.returnTo));
  return launchUrl.toString();
}

router.post("/auctorio/launch", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = LaunchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "workspace must be a non-empty string",
    });
    return;
  }

  const user = req.user;
  if (!user?.email) {
    res.status(401).json({
      code: "UNAUTHENTICATED",
      message: "Missing authenticated user email",
    });
    return;
  }

  const workspace = parsed.data.workspace.trim().toLowerCase();
  const returnTo = resolveAuctorioReturnTo(parsed.data.returnTo);

  if (!getAllowedFirstPartyWorkspaces().has(workspace)) {
    res.status(403).json({
      code: "AUCTORIO_WORKSPACE_NOT_ALLOWED",
      message: "This workspace is not enabled for secure launch",
    });
    return;
  }

  const payload = {
    workspace,
    email: user.email.trim().toLowerCase(),
    displayName: user.displayName?.trim() || undefined,
    returnTo,
    sourceApp: "webtecnoria" as const,
  };
  const rawBody = JSON.stringify(payload);
  const timestamp = String(Date.now());
  const signature = buildLaunchSignature(timestamp, rawBody);

  try {
    const response = await fetch(
      new URL("/studio/api/auth/launch-tickets", env.AUCTORIO_STUDIO_INTERNAL_URL),
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-launch-client": env.AUCTORIO_LAUNCH_CLIENT_ID,
          "x-launch-timestamp": timestamp,
          "x-launch-signature": signature,
        },
        body: rawBody,
      }
    );

    const data = (await response.json()) as
      | LaunchTicketResponse
      | { error?: string; message?: string };

    if (!response.ok || !("launchId" in data)) {
      const message = "message" in data ? String(data.message || "") : "";
      if (response.status === 403) {
        if (
          message === "interactive_login_required" ||
          message === "workspace_launch_not_allowed"
        ) {
          res.status(409).json({
            code: "AUCTORIO_INTERACTIVE_LOGIN_REQUIRED",
            message:
              message === "workspace_launch_not_allowed"
                ? "This workspace requires normal Studio login"
                : "Interactive Studio login is required for this user",
          });
          return;
        }

        res.status(403).json({
          code: "AUCTORIO_ACCESS_DENIED",
          message: message || "User is not allowed to access the target workspace",
        });
        return;
      }

      if (response.status === 404) {
        res.status(502).json({
          code: "AUCTORIO_WORKSPACE_UNAVAILABLE",
          message: message || "Target workspace is not available for secure launch",
        });
        return;
      }

      res.status(502).json({
        code: "AUCTORIO_LAUNCH_UNAVAILABLE",
        message: message || "Could not create secure Auctorio launch ticket",
      });
      return;
    }

    res.json({
      redirectUrl: buildPublicLaunchUrl(data),
    });
  } catch (error) {
    res.status(502).json({
      code: "AUCTORIO_LAUNCH_UNAVAILABLE",
      message: error instanceof Error ? error.message : "Could not reach Auctorio",
    });
  }
});

export default router;
