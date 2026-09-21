import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/legal-document";
import { PRIVACY_SECTIONS } from "@/lib/legal";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return <LegalDocument title="Privacy Policy" sections={PRIVACY_SECTIONS} />;
}
