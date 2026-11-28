"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconArrowDown } from "@/components/icons";
import { Screen } from "@/components/screen";
import { SuccessMark } from "@/components/success-mark";

export default function SenhaValidadaPage() {
  const router = useRouter();
  const [segundos, setSegundos] = useState(5);

  useEffect(() => {
    const voltar = setTimeout(() => router.push("/"), 5000);
    const tick = setInterval(() => {
      setSegundos((atual) => (atual > 1 ? atual - 1 : 1));
    }, 1000);
    return () => {
      clearTimeout(voltar);
      clearInterval(tick);
    };
  }, [router]);

  const textoTempo = segundos === 1 ? "1 segundo" : `${segundos} segundos`;

  return (
    <Screen variant="validada">
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-3xl flex-col items-center justify-center px-6 py-10 text-center md:px-10">
        <SuccessMark />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink md:text-5xl lg:text-6xl">
          Senha validada!
        </h1>
        <p className="mt-2 text-base font-semibold text-muted md:text-lg">
          Sua tag já pode ser retirada.
        </p>

        <div className="mt-8 flex w-full max-w-xl items-center justify-between gap-6 rounded-[28px] bg-mint px-6 py-7 text-left md:max-w-2xl md:px-8 md:py-8 lg:mt-10">
          <p className="text-xl font-extrabold leading-tight text-ink md:text-2xl">
            Retire a tag RFID na bandeja abaixo.
          </p>
          <IconArrowDown className="h-10 w-10 shrink-0 text-brand md:h-12 md:w-12" />
        </div>

        <p className="mt-8 text-sm font-bold text-muted md:text-base">
          Voltando para a tela inicial em {textoTempo}...
        </p>
        <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-ink/10">
          <div className="animate-refill h-full rounded-full bg-brand" />
        </div>
      </div>
    </Screen>
  );
}
