"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { VolunteerApplicationModal } from "./VolunteerApplicationModal";

type VolunteerCTAProps = {
  ngoId: string;
  ngoSlug: string;
  ngoName: string;
  programs: { id: string; title: string }[];
};

/**
 * Volunteer call-to-action button plus its application modal.
 * Client component so it can own the open/close state on an otherwise
 * server-rendered NGO profile page.
 */
export function VolunteerCTA({
  ngoId,
  ngoSlug,
  ngoName,
  programs,
}: VolunteerCTAProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Volunteer with us</Button>
      <VolunteerApplicationModal
        ngoId={ngoId}
        ngoSlug={ngoSlug}
        ngoName={ngoName}
        programs={programs}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
