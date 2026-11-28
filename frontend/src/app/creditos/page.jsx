import Link from "next/link";
import { IconArrowRight, IconList, IconLogout } from "@/components/icons";
import { Screen } from "@/components/screen";
import { SuccessMark } from "@/components/success-mark";
import { alunoDemo, formatarReais } from "@/lib/totem-demo";

export default function CreditosPage() {
  const aluno = alunoDemo;

  return (
    <Screen variant="creditos">
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-5xl content-center gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-center lg:gap-16">
        <div className="text-center lg:text-left">
          <SuccessMark className="lg:mx-0" />
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Créditos validados!
          </h1>
          <p className="mt-2 text-base font-semibold text-muted md:text-lg">
            Você já pode acessar o restaurante.
          </p>
          <p className="mt-6 text-xl font-extrabold text-ink md:text-2xl">{aluno.nome}</p>
          <p className="mt-5 text-sm font-bold uppercase tracking-wide text-muted">Seu saldo</p>
          <p className="text-5xl font-extrabold tracking-tight text-brand md:text-6xl lg:text-7xl">
            {formatarReais(aluno.saldoCentavos)}
          </p>
          <p className="mt-2 text-base font-semibold text-muted md:text-lg">
            Equivalente a {aluno.refeicoesDisponiveis} refeições.
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-3 lg:mx-0 lg:max-w-none">
          <Link
            href="/extrato"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(27,143,76,0.22)] transition hover:bg-brand-dark md:h-16 md:text-lg"
          >
            <IconList />
            Consultar extrato
            <IconArrowRight />
          </Link>
          <Link
            href="/"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-6 text-base font-extrabold text-ink transition hover:bg-cream md:h-16 md:text-lg"
          >
            <IconLogout />
            Encerrar atendimento
          </Link>
        </div>
      </div>
    </Screen>
  );
}
