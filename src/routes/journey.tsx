import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart3, Clock, Flame, Leaf, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeJourney } from "@/lib/stats";
import { formatMinutesLabel, formatTotalTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey")({ component: JourneyPage });

type Tab = "overview" | "streaks" | "insights";

function JourneyPage() {
  const navigate = useNavigate();
  const sessions = useStore((s) => s.sessions);
  const isPremium = useStore((s) => s.isPremium);
  const stats = computeJourney(sessions);
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <main className="page-enter flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl tracking-tight">My Journey</h1>
      </header>

      <div className="flex gap-2 rounded-full bg-surface p-1">
        {(
          [
            ["overview", "Overview"],
            ["streaks", "Streaks"],
            ["insights", "Insights"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-9 flex-1 rounded-full text-sm text-muted",
              tab === id && "bg-accent text-accent-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <section className="grid grid-cols-2 gap-3">
            <Stat
              icon={Clock}
              label="Total Meditation"
              value={formatTotalTime(stats.totalSeconds)}
            />
            <Stat
              icon={BarChart3}
              label="Sessions"
              value={String(stats.sessionCount)}
            />
            <Stat
              icon={Flame}
              label="Current Streak"
              value={dayCount(stats.currentStreak)}
            />
            <Stat
              icon={Star}
              label="Longest Streak"
              value={dayCount(stats.longestStreak)}
            />
          </section>
          <WeekDots week={stats.week} />
        </>
      ) : null}

      {tab === "streaks" ? (
        <>
          <section className="grid grid-cols-2 gap-3">
            <Stat
              icon={Flame}
              label="Current Streak"
              value={dayCount(stats.currentStreak)}
            />
            <Stat
              icon={Star}
              label="Longest Streak"
              value={dayCount(stats.longestStreak)}
            />
          </section>
          <WeekDots week={stats.week} />
        </>
      ) : null}

      {tab === "insights" ? (
        isPremium ? (
          <>
            <section className="grid grid-cols-2 gap-3">
              <Stat
                icon={Clock}
                label="Average session"
                value={
                  stats.avgSeconds ? formatTotalTime(stats.avgSeconds) : "—"
                }
              />
              <Stat icon={Leaf} label="Often chosen" value={stats.favoriteSound} />
            </section>
            <WeekBars week={stats.week} />
          </>
        ) : (
          <section className="rounded-xl bg-card p-5 text-center shadow-card">
            <p className="font-display text-xl tracking-tight">
              Detailed insights
            </p>
            <p className="mt-2 text-sm text-muted">
              Premium unlocks averages, favorites, and a week of practice at a glance.
            </p>
            <Button
              variant="start"
              className="mt-5 rounded-full"
              onClick={() => void navigate({ to: "/premium" })}
            >
              Unlock insights
            </Button>
          </section>
        )
      ) : null}

      <section>
        <h2 className="font-display text-xl tracking-tight">Recent</h2>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Your first minutes will appear here — no rush.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {sessions.slice(0, 12).map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{session.soundName}</p>
                  <p className="text-sm text-subtle">
                    {new Date(session.startedAt).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm text-muted">
                  {formatMinutesLabel(
                    Math.max(1, Math.round(session.completedSeconds / 60)),
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function dayCount(n: number) {
  return n === 1 ? "1 day" : `${n} days`;
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock;
}) {
  return (
    <div className="rounded-xl bg-card px-4 py-5 shadow-card">
      <p className="flex items-center gap-1.5 text-xs tracking-wide text-subtle">
        <Icon className="size-3.5 text-accent" aria-hidden />
        {label}
      </p>
      <p className="mt-2 font-display text-2xl tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

function WeekDots({
  week,
}: {
  week: { key: string; label: string; active: boolean }[];
}) {
  return (
    <section className="rounded-xl bg-card p-5 shadow-card">
      <h2 className="text-sm tracking-wide text-subtle">This Week</h2>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {week.map((day) => (
          <div key={day.key} className="flex flex-col items-center gap-2">
            <span className="text-xs text-subtle">{day.label}</span>
            <span
              className={cn(
                "size-3 rounded-full",
                day.active ? "bg-accent" : "bg-surface",
              )}
              aria-label={
                day.active ? `${day.label}, practiced` : `${day.label}, open`
              }
            />
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted">
        Whenever you're ready, your peaceful space is here.
      </p>
    </section>
  );
}

function WeekBars({
  week,
}: {
  week: { key: string; label: string; active: boolean; seconds: number }[];
}) {
  const max = Math.max(...week.map((d) => d.seconds), 1);
  return (
    <section className="rounded-xl bg-card p-5 shadow-card">
      <h2 className="text-sm tracking-wide text-subtle">This Week</h2>
      <div className="mt-4 grid grid-cols-7 items-end gap-2">
        {week.map((day) => {
          const h = Math.max(8, Math.round((day.seconds / max) * 96));
          return (
            <div key={day.key} className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end justify-center">
                <span
                  className={cn(
                    "w-3 rounded-full",
                    day.active ? "bg-accent" : "bg-surface",
                  )}
                  style={{ height: day.active ? `${h}px` : "8px" }}
                  aria-label={`${day.label}, ${formatTotalTime(day.seconds)}`}
                />
              </div>
              <span className="text-xs text-subtle">{day.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
