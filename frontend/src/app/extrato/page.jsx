import Link from "next/link";
import { IconArrowLeft, IconList, IconLogout, IconSpark, IconTrend, IconWallet } from "@/components/icons";
import { Screen } from "@/components/screen";
import { alunoDemo, formatarReais } from "@/lib/totem-demo";

export default function ExtratoPage() {
  const aluno = alunoDemo;

  return (
    <Screen variant="extrato">
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-6xl gap-6 px-5 py-6 md:grid-cols-2 md:gap-8 md:px-8 md:py-8 lg:px-10">
        <section className="flex flex-col">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Olá, {aluno.primeiroNome}!
          </h1>
          <p className="mt-2 max-w-sm text-base font-semibold text-muted">
            Aqui está seu saldo e suas movimentações.
          </p>

          <div className="relative mt-6 overflow-hidden rounded-[28px] bg-brand p-6 text-white shadow-[0_12px_30px_rgba(27,143,76,0.22)] md:p-7">
            <img
              src="/mancha1.png"
              alt=""
              className="pointer-events-none absolute -right-10 -top-8 w-48 opacity-40"
            />
            <div className="relative flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                <IconWallet />
              </span>
              <p className="text-sm font-bold text-white/90">Seu saldo</p>
            </div>
            <p className="relative mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              {formatarReais(aluno.saldoCentavos)}
            </p>
            <p className="relative mt-4 inline-flex rounded-full bg-sun px-3 py-1 text-sm font-extrabold text-ink">
              {aluno.refeicoesDisponiveis} refeições disponíveis
            </p>
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(20,48,40,0.05)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint text-brand">
              <IconTrend />
            </span>
            <div>
              <p className="text-sm font-bold text-muted">Última recarga</p>
              <p className="text-2xl font-extrabold text-ink">
                {formatarReais(aluno.ultimaRecarga.valorCentavos)}
              </p>
              <p className="text-sm font-semibold text-muted">
                Realizada via {aluno.ultimaRecarga.meio} em {aluno.ultimaRecarga.quando}
              </p>
            </div>
          </div>

          <p className="relative mt-auto hidden max-w-[240px] pt-8 font-hand text-3xl font-semibold leading-tight text-ink md:block">
            <IconSpark className="absolute -left-2 -top-4 h-7 w-7" />
            Mais autonomia para você e mais organização para o RU.
          </p>
        </section>

        <section className="flex flex-col pb-12">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(20,48,40,0.06)]">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream text-brand">
                  <IconList className="h-4 w-4" />
                </span>
                Movimentações
              </h2>
              <span className="text-sm font-extrabold text-brand">Ver todas</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-cream text-muted">
                <tr>
                  <th className="px-5 py-3 font-bold">Data</th>
                  <th className="px-5 py-3 font-bold">Descrição</th>
                  <th className="px-5 py-3 text-right font-bold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {aluno.movimentacoes.map((item) => {
                  const positivo = item.valorCentavos > 0;
                  return (
                    <tr key={item.id} className="border-t border-ink/5">
                      <td className="px-5 py-3.5 font-semibold text-ink/80">{item.data}</td>
                      <td className="px-5 py-3.5 font-bold text-ink">{item.descricao}</td>
                      <td
                        className={`px-5 py-3.5 text-right font-extrabold ${
                          positivo ? "text-brand" : "text-danger"
                        }`}
                      >
                        {positivo ? "+ " : "− "}
                        {formatarReais(item.valorCentavos)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/creditos"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-4 text-sm font-extrabold text-ink transition hover:bg-cream md:text-base"
            >
              <IconArrowLeft />
              Voltar
            </Link>
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-4 text-sm font-extrabold text-white transition hover:bg-brand-dark md:text-base"
            >
              <IconLogout />
              Encerrar atendimento
            </Link>
          </div>

          <p className="relative mt-6 max-w-[240px] font-hand text-3xl font-semibold leading-tight text-ink md:hidden">
            Mais autonomia para você e mais organização para o RU.
          </p>
        </section>
      </div>
    </Screen>
  );
}
