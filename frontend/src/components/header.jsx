"use client";

import { useEffect, useState } from "react";

const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatarData(data) {
  return `${dias[data.getDay()]}, ${data.getDate()} de ${meses[data.getMonth()]}`;
}

function formatarHora(data) {
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function Header() {
  const [agora, setAgora] = useState(null);

  useEffect(() => {
    const atualizar = () => setAgora(new Date());
    atualizar();
    const id = setInterval(atualizar, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-brand px-5 text-white md:px-8 lg:px-10">
      <div className="relative h-12 w-[190px] overflow-hidden md:h-14 md:w-[236px] lg:w-[268px]">
        <img
          src="/logo2.png"
          alt="Refê. Recarregou, validou, comeu."
          className="absolute left-0 top-1/2 h-[132px] w-auto max-w-none -translate-y-1/2 brightness-0 invert md:h-[154px] lg:h-[176px]"
        />
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-white/90 md:text-sm">
          {agora ? formatarData(agora) : "\u00A0"}
        </p>
        <p className="text-xl font-extrabold leading-none tracking-tight md:text-2xl">
          {agora ? formatarHora(agora) : "\u00A0"}
        </p>
      </div>
    </header>
  );
}
