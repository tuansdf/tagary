import { EMOTION_OPTIONS } from "@/types";

interface EmotionPickerProps {
  value?: number;
  onChange: (score: number | undefined) => void;
}

export function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  return (
    <div className="flex items-center gap-1">
      {EMOTION_OPTIONS.map((option) => (
        <button
          key={option.score}
          type="button"
          className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 transition-all ${
            value === option.score
              ? "bg-primary/10 ring-2 ring-primary scale-110"
              : "hover:bg-accent hover:scale-105"
          }`}
          onClick={() =>
            onChange(value === option.score ? undefined : option.score)
          }
          title={option.label}
        >
          <span className="text-xl">{option.emoji}</span>
          <span className="text-[10px] text-muted-foreground leading-none">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
