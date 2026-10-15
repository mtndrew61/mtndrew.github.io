export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium tracking-wide text-emerald-700 uppercase">
          Fitness Tracker
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900">
          Log a workout. Estimate the burn.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          Step 1 is done: the Next.js app is running. Next we will add a form
          so you can describe your workout and how long it lasted.
        </p>
      </div>
    </main>
  );
}
