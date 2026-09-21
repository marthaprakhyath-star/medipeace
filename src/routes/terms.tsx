import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/legal-document";
import { TERMS_SECTIONS } from "@/lib/legal";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return <LegalDocument title="Terms of Use" sections={TERMS_SECTIONS} />;
}
