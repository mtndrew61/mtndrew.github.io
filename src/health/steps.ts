export type StepRead =
  | { ok: true; steps: number; source: "health" }
  | { ok: false; source: "simulator"; reason: string };

/** Local midnight → now, ISO strings for Health queries. */
export function todayStepWindow(now = new Date()): {
  startDate: string;
  endDate: string;
  day: string;
} {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
    day,
  };
}

export function sumStepSamples(
  samples: Array<{ value?: number }> | undefined,
): number {
  if (!samples?.length) return 0;
  return Math.max(
    0,
    Math.round(samples.reduce((sum, sample) => sum + (sample.value ?? 0), 0)),
  );
}

/**
 * Read today's step total from Apple Health (iOS) or Health Connect (Android).
 * The browser demo has no HealthKit — callers keep the step simulator.
 */
export async function readTodaySteps(): Promise<StepRead> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) {
      return {
        ok: false,
        source: "simulator",
        reason: "Browser demo. On iPhone, Sync Apple Health fills today’s stamina.",
      };
    }

    const { Health } = await import("@capgo/capacitor-health");
    const availability = await Health.isAvailable();
    if (!availability.available) {
      return {
        ok: false,
        source: "simulator",
        reason: availability.reason ?? "Health data is not available on this device.",
      };
    }

    await Health.requestAuthorization({ read: ["steps"] });
    const window = todayStepWindow();
    const { samples } = await Health.queryAggregated({
      dataType: "steps",
      startDate: window.startDate,
      endDate: window.endDate,
      bucket: "day",
      aggregation: "sum",
    });
    return { ok: true, steps: sumStepSamples(samples), source: "health" };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Could not read Apple Health.";
    return { ok: false, source: "simulator", reason };
  }
}
