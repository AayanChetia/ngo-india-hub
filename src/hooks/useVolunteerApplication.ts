"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type ApplicationStatus = "idle" | "submitting" | "success" | "error";

export type VolunteerApplicationInput = {
  /** Selected program id, or null when the NGO has no programs. */
  programId?: string | null;
  /** Availability preference, stored alongside the message. */
  availability: string;
  message: string;
};

type UseVolunteerApplicationArgs = {
  ngoId: string;
  ngoSlug: string;
};

/**
 * Submits a volunteer application for the given NGO.
 *
 * Requires an authenticated user — if none, redirects to /login with a
 * redirect back to the NGO profile. Surfaces a friendly message when the
 * user has already applied (Postgres unique-violation 23505).
 */
export function useVolunteerApplication({
  ngoId,
  ngoSlug,
}: UseVolunteerApplicationArgs) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const submit = useCallback(
    async ({ programId, availability, message }: VolunteerApplicationInput) => {
      setStatus("submitting");
      setError(null);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/ngo/${ngoSlug}`);
        return;
      }

      // Availability isn't a dedicated column — fold it into the message.
      const composedMessage = `Availability: ${availability}\n\n${message.trim()}`;

      const { error: insertError } = await supabase
        .from("volunteer_applications")
        .insert({
          user_id: user.id,
          ngo_id: ngoId,
          program_id: programId ?? null,
          message: composedMessage,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("You've already applied to this NGO");
        } else {
          setError(insertError.message || "Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }

      setStatus("success");
    },
    [ngoId, ngoSlug, router]
  );

  return { submit, status, error, reset };
}
