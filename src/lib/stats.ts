import type { SessionRecord } from "@/lib/types";

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function computeJourney(sessions: SessionRecord[]) {
  const completed = sessions.filter((s) => s.completedSeconds > 0);
  const totalSeconds = completed.reduce((n, s) => n + s.completedSeconds, 0);
  const sessionCount = completed.length;

  const days = new Set(
    completed.filter((s) => s.completed).map((s) => dayKey(s.startedAt)),
  );

  const today = startOfDay(Date.now());
  let currentStreak = 0;
  let cursor = today;
  if (!days.has(dayKey(today))) {
    cursor = today - 86400000;
  }
  while (days.has(dayKey(cursor))) {
    currentStreak += 1;
    cursor -= 86400000;
  }

  let longestStreak = 0;
  let run = 0;
  const sortedDays = [...days].sort((a, b) => {
    const [ay, am, ad] = a.split("-").map(Number);
    const [by, bm, bd] = b.split("-").map(Number);
    return (
      new Date(ay, am, ad).getTime() - new Date(by, bm, bd).getTime()
    );
  });
  let prev = 0;
  for (const key of sortedDays) {
    const [y, m, d] = key.split("-").map(Number);
    const t = new Date(y, m, d).getTime();
    if (prev && t - prev === 86400000) run += 1;
    else run = 1;
    longestStreak = Math.max(longestStreak, run);
    prev = t;
  }

  const week = weekDots(completed);
  const todaySeconds = completed
    .filter((s) => startOfDay(s.startedAt) === today)
    .reduce((n, s) => n + s.completedSeconds, 0);

  const avgSeconds =
    sessionCount === 0 ? 0 : Math.round(totalSeconds / sessionCount);

  const soundCounts = new Map<string, number>();
  for (const s of completed) {
    soundCounts.set(s.soundName, (soundCounts.get(s.soundName) ?? 0) + 1);
  }
  let favoriteSound = "—";
  let favCount = 0;
  for (const [name, count] of soundCounts) {
    if (count > favCount) {
      favoriteSound = name;
      favCount = count;
    }
  }

  return {
    totalSeconds,
    sessionCount,
    currentStreak,
    longestStreak,
    week,
    todaySeconds,
    avgSeconds,
    favoriteSound,
  };
}

export type WeekDot = {
  key: string;
  label: string;
  active: boolean;
  seconds: number;
};

export function weekDots(sessions: SessionRecord[]): WeekDot[] {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = startOfDay(now.getTime() - day * 86400000);
  const secondsByDay = new Map<string, number>();
  for (const s of sessions) {
    if (s.completed || s.completedSeconds > 0) {
      const key = dayKey(s.startedAt);
      secondsByDay.set(key, (secondsByDay.get(key) ?? 0) + s.completedSeconds);
    }
  }
  return labels.map((label, i) => {
    const ts = monday + i * 86400000;
    const key = dayKey(ts);
    const seconds = secondsByDay.get(key) ?? 0;
    return { key, label, active: seconds > 0, seconds };
  });
}
