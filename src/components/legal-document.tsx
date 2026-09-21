import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { LEGAL_UPDATED } from "@/lib/legal";

export function LegalDocument({
  title,
  sections,
}: {
  title: string;
  sections: readonly { title: string; body: string }[];
}) {
  const navigate = useNavigate();

  return (
    <main className="page-enter flex flex-col gap-6">
      <header className="relative flex items-center justify-center">
        <button
          type="button"
          aria-label="Back"
          className="absolute left-0 grid size-11 place-items-center text-muted"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
              return;
            }
            void navigate({ to: "/" });
          }}
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="font-display text-xl tracking-tight">{title}</h1>
      </header>
      <p className="text-center text-sm text-subtle">Updated {LEGAL_UPDATED}</p>
      {sections.map((section) => (
        <section key={section.title} className="rounded-xl bg-card px-4 py-4 shadow-card">
          <h2 className="font-medium">{section.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
        </section>
      ))}
    </main>
  );
}
