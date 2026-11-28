import { Blobs } from "@/components/blobs";

export function Screen({ variant, children }) {
  return (
    <main className="relative isolate min-h-[calc(100dvh-5rem)] overflow-hidden">
      <Blobs variant={variant} />
      {children}
      <p className="pointer-events-none absolute bottom-4 right-5 z-20 text-right text-[11px] font-extrabold uppercase leading-tight tracking-wide text-brand md:bottom-6 md:right-8 md:text-xs">
        Restaurante
        <br />
        Universitário
      </p>
    </main>
  );
}
