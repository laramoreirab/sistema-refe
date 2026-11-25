import Link from "next/link";
import { IconArrowRight, IconCard, IconKey, IconSpark } from "@/components/icons";
import { Screen } from "@/components/screen";

export default function BoasVindasPage() {
  return (
    <Screen variant="boasVindas">
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-6xl content-center gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-2 lg:items-center lg:gap-x-16 lg:px-14">
        <div className="contents lg:flex lg:min-h-[26rem] lg:flex-col lg:justify-center">
          <h1 className="max-w-xl text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-ink md:text-6xl lg:text-7xl">
            Bem-vindo
            <br />
            ao Refê
          </h1>
          <p className="mt-3 max-w-md text-base font-semibold text-muted md:text-lg">
            Escolha uma opção para continuar.
          </p>
          <p className="relative order-4 mt-2 max-w-[220px] font-hand text-[1.7rem] font-semibold leading-tight text-ink md:text-3xl lg:order-none lg:mt-16">
            <IconSpark className="absolute -left-3 -top-5 h-8 w-8" />
            Seu intervalo é curto demais pra ficar em fila.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <Link
            href="/senha"
            className="flex items-center gap-4 rounded-[28px] bg-sun px-4 py-4 shadow-[0_10px_28px_rgba(20,48,40,0.06)] transition hover:-translate-y-0.5 md:gap-5 md:px-6 md:py-5"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/75 text-ink md:h-16 md:w-16">
              <IconKey className="h-7 w-7 md:h-8 md:w-8" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-lg font-extrabold leading-tight text-ink md:text-xl">
                Possui uma senha temporária?
              </span>
              <span className="mt-1 block text-sm font-semibold text-ink/70 md:text-base">
                Retire sua tag de acesso.
              </span>
            </span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white md:h-14 md:w-14">
              <IconArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            </span>
          </Link>

          <Link
            href="/creditos"
            className="flex items-center gap-4 rounded-[28px] bg-mint px-4 py-4 shadow-[0_10px_28px_rgba(20,48,40,0.06)] transition hover:-translate-y-0.5 md:gap-5 md:px-6 md:py-5"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white md:h-16 md:w-16">
              <IconCard className="h-7 w-7 md:h-8 md:w-8" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-lg font-extrabold leading-tight text-ink md:text-xl">
                Validar créditos
              </span>
              <span className="mt-1 block text-sm font-semibold text-ink/70 md:text-base">
                Encoste sua carteirinha no leitor.
              </span>
            </span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white md:h-14 md:w-14">
              <IconArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            </span>
          </Link>
        </div>
      </div>
    </Screen>
  );
}
