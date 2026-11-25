import { IconCheck } from "@/components/icons";

export function SuccessMark({ className = "" }) {
  return (
    <div className={`relative mx-auto h-28 w-28 md:h-32 md:w-32 ${className}`}>
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          className="absolute left-1/2 top-1/2 h-3.5 w-1.5 rounded-full bg-sun"
          style={{
            transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-58px)`,
          }}
        />
      ))}
      <div className="absolute inset-3 grid place-items-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(27,143,76,0.28)] md:inset-3.5">
        <IconCheck className="h-10 w-10 md:h-12 md:w-12" />
      </div>
    </div>
  );
}
