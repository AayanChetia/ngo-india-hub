"use client";

import { useEffect, useMemo, useState } from "react";
import { X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useVolunteerApplication } from "@/hooks/useVolunteerApplication";
import { cn } from "@/lib/utils";

type ProgramOption = { id: string; title: string };

type VolunteerApplicationModalProps = {
  ngoId: string;
  ngoSlug: string;
  ngoName: string;
  programs: ProgramOption[];
  isOpen: boolean;
  onClose: () => void;
};

const AVAILABILITY_OPTIONS = ["Weekdays", "Weekends", "Both", "Flexible"] as const;
type Availability = (typeof AVAILABILITY_OPTIONS)[number];

const MIN_MESSAGE_LENGTH = 20;

/**
 * Volunteer application form for an NGO profile. Renders as a bottom sheet on
 * mobile and a centered modal on desktop. Closes on backdrop click and Escape.
 */
export function VolunteerApplicationModal({
  ngoId,
  ngoSlug,
  ngoName,
  programs,
  isOpen,
  onClose,
}: VolunteerApplicationModalProps) {
  const { submit, status, error, reset } = useVolunteerApplication({
    ngoId,
    ngoSlug,
  });

  const [programId, setProgramId] = useState<string>("");
  const [availability, setAvailability] = useState<Availability>("Flexible");
  const [message, setMessage] = useState("");

  const messageValid = message.trim().length >= MIN_MESSAGE_LENGTH;
  const submitting = status === "submitting";
  const succeeded = status === "success";

  // Reset the form whenever the modal is opened afresh.
  useEffect(() => {
    if (isOpen) {
      setProgramId("");
      setAvailability("Flexible");
      setMessage("");
      reset();
    }
  }, [isOpen, reset]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const titleId = useMemo(() => "volunteer-modal-title", []);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!messageValid || submitting) return;
    await submit({
      programId: programs.length > 0 ? programId || null : null,
      availability,
      message,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel: bottom sheet on mobile, centered modal on desktop */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div
          className={cn(
            "relative flex max-h-[90vh] w-full flex-col overflow-hidden bg-white shadow-xl",
            "rounded-t-2xl sm:max-w-lg sm:rounded-2xl"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-ink-900">
                {succeeded ? "Application sent!" : "Volunteer with"}
              </h2>
              {!succeeded && (
                <p className="mt-0.5 text-sm text-ink-500">{ngoName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1.5 rounded-full p-1.5 text-ink-500 hover:bg-ink-100"
            >
              <X size={20} />
            </button>
          </div>

          {succeeded ? (
            <ConfirmationScreen onClose={onClose} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 overflow-y-auto px-6 py-5"
            >
              {/* Program dropdown */}
              {programs.length > 0 && (
                <div>
                  <label
                    htmlFor="program"
                    className="block text-sm font-medium text-ink-800"
                  >
                    Programme{" "}
                    <span className="font-normal text-ink-400">(optional)</span>
                  </label>
                  <select
                    id="program"
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">No preference</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Availability segmented control */}
              <div>
                <span className="block text-sm font-medium text-ink-800">
                  Availability
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-xl bg-ink-50 p-1 sm:grid-cols-4">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAvailability(opt)}
                      aria-pressed={availability === opt}
                      className={cn(
                        "h-9 rounded-lg text-sm font-medium transition-colors",
                        availability === opt
                          ? "bg-white text-primary-700 shadow-sm"
                          : "text-ink-600 hover:text-ink-900"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-ink-800"
                >
                  Why do you want to volunteer?
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tell them a little about yourself and how you'd like to help…"
                  className="mt-1.5 w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      "text-ink-400",
                      message.length > 0 && !messageValid && "text-amber-600"
                    )}
                  >
                    {messageValid
                      ? "Looks good"
                      : `At least ${MIN_MESSAGE_LENGTH} characters`}
                  </span>
                  <span className="text-ink-400">{message.trim().length}</span>
                </div>
              </div>

              {/* Inline error */}
              {status === "error" && error && (
                <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={!messageValid || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send application"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmationScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 size={36} />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-ink-900">
        Application sent!
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-500">
        Thanks for stepping up. The NGO will review your application and reach
        out to you directly.
      </p>
      <Button variant="outline" onClick={onClose} className="mt-6 w-full">
        Close
      </Button>
    </div>
  );
}
