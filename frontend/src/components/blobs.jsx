const layouts = {
  boasVindas: [
    { src: "/mancha1.png", className: "-left-[8%] -top-[8%] w-[240px] md:w-[340px] lg:w-[420px] -rotate-6" },
    { src: "/mancha2.png", className: "-bottom-[18%] -left-[8%] w-[300px] md:w-[420px] lg:w-[520px]" },
    { src: "/mancha3.png", className: "-bottom-[12%] -right-[8%] w-[240px] md:w-[320px] lg:w-[380px] rotate-12" },
  ],
  senha: [
    { src: "/mancha1.png", className: "-left-[12%] top-[8%] w-[220px] md:w-[300px] lg:w-[360px]" },
    { src: "/mancha4.png", className: "-bottom-[14%] -right-[10%] w-[280px] md:w-[380px] lg:w-[460px]" },
  ],
  validada: [
    { src: "/mancha2.png", className: "-right-[8%] top-[2%] w-[240px] md:w-[340px] lg:w-[400px] rotate-6" },
    { src: "/mancha1.png", className: "-bottom-[16%] -left-[10%] w-[280px] md:w-[380px] lg:w-[460px]" },
    { src: "/mancha3.png", className: "-bottom-[8%] right-[6%] w-[180px] md:w-[240px] opacity-80" },
  ],
  creditos: [
    { src: "/mancha1.png", className: "-right-[6%] -top-[4%] w-[200px] md:w-[280px] lg:w-[320px]" },
    { src: "/mancha3.png", className: "-bottom-[14%] -left-[10%] w-[260px] md:w-[360px] lg:w-[420px]" },
    { src: "/mancha2.png", className: "-bottom-[10%] -right-[6%] w-[220px] md:w-[300px] lg:w-[360px]" },
  ],
  extrato: [
    { src: "/mancha1.png", className: "left-[8%] top-[12%] w-[180px] md:w-[240px] opacity-80" },
    { src: "/mancha2.png", className: "-bottom-[18%] -left-[6%] w-[280px] md:w-[380px]" },
    { src: "/mancha4.png", className: "-bottom-[12%] -right-[8%] w-[220px] md:w-[300px] opacity-90" },
  ],
};

export function Blobs({ variant }) {
  const items = layouts[variant] ?? [];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <img
          key={item.src + item.className}
          src={item.src}
          alt=""
          className={`absolute select-none ${item.className}`}
        />
      ))}
    </div>
  );
}
