type StarSize = "sm" | "md" | "lg";

const sizeClass: Record<StarSize, string> = {
  sm: "text-sm leading-none",
  md: "text-lg leading-none",
  lg: "text-2xl leading-none",
};

export function StarDisplay({
  value,
  size = "md",
  className = "",
}: {
  /** 0–5; en yakın tam yıldıza yuvarlanır */
  value: number;
  size?: StarSize;
  className?: string;
}) {
  const rounded = Math.min(5, Math.max(0, Math.round(value)));
  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${sizeClass[size]} ${className}`}
      role="img"
      aria-label={`${value.toFixed(1)} üzerinden 5 yıldız`}
    >
      {stars.map((i) => (
        <span
          key={i}
          className={i <= rounded ? "text-amber-400" : "text-zinc-200"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
  id,
  name,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label={name}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          id={id ? `${id}-${n}` : undefined}
          disabled={disabled}
          onClick={() => onChange(n)}
          className={`rounded-md px-1.5 py-0.5 text-xl leading-none transition ${
            n <= value
              ? "text-amber-400"
              : "text-zinc-200 hover:text-zinc-300"
          } ${disabled ? "opacity-50" : ""}`}
          aria-pressed={n <= value}
          aria-label={`${n} yıldız`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
