import { cn } from "@/lib/utils/tailwind";

interface LoaderProps {
  className?: string;
}

export function Loader({ className }: LoaderProps) {
  return (
    <div
      // animate-spin ensures Tailwind injects the rotation keyframes
      className={cn("relative h-8 w-8 animate-spin", className)}
      style={{
        // Overriding the smooth linear spin with 12 hard steps
        animationTimingFunction: "steps(12)",
        animationDuration: "1.2s",
      }}
    >
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          // Each wrapper takes the full size of the parent, making rotation origin dead center
          className="absolute left-0 top-0 h-full w-full"
          style={{ transform: `rotate(${i * 30}deg)` }}
        >
          <span
            // mx-auto perfectly centers the spoke at the top of the wrapper
            // Percentages ensure the loader scales flawlessly if you change the parent w/h classes
            className="mx-auto block h-[28%] w-[8.5%] rounded-full bg-gray-500"
            style={{
              opacity: (i + 1) / 12,
            }}
          />
        </div>
      ))}
    </div>
  );
}
