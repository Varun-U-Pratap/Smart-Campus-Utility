export const BackgroundArt = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40 dark:bg-[linear-gradient(rgba(56,189,248,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.07)_1px,transparent_1px)]" />

      <div className="theme-float-orb absolute left-[10%] top-[12%] h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-cyan-400/20" />
      <div className="theme-float-orb-slow absolute bottom-[8%] right-[8%] h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-400/18" />

      <svg
        className="absolute -top-24 left-[-120px] h-[420px] w-[420px] opacity-70 dark:opacity-85"
        viewBox="0 0 420 420"
        fill="none"
      >
        <defs>
          <linearGradient id="bg-shape-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <path
          d="M56 188.2C75.7 88.2 166.3 14 259.8 35.3C350.7 56.1 419.5 141.8 394.9 236.9C370.5 331.3 281.8 401.8 185.2 386.6C84.7 370.8 36.7 286.8 56 188.2Z"
          fill="url(#bg-shape-a)"
        />
      </svg>

      <svg
        className="absolute -bottom-24 right-[-140px] h-[420px] w-[420px] opacity-70 dark:opacity-85"
        viewBox="0 0 420 420"
        fill="none"
      >
        <defs>
          <linearGradient id="bg-shape-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <path
          d="M350.4 238.6C329 338.2 240.6 409.8 146.6 389.2C55.1 369.2 -15.8 285.7 6.8 189.5C29.3 94.2 116.9 22.7 213.4 35C313.9 47.8 371.3 141.2 350.4 238.6Z"
          fill="url(#bg-shape-b)"
        />
      </svg>
    </div>
  );
};
