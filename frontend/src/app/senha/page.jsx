"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconAlert, IconArrowLeft, IconArrowRight, IconHelp, IconLock } from "@/components/icons";
import { Screen } from "@/components/screen";
import { validarSenhaTemporaria } from "@/lib/totem-demo";

const TAMANHO = 6;

export default function SenhaPage() {
  const router = useRouter();
  const campo = useRef(null);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function aoDigitar(valor) {
    const digitos = valor.replace(/\D/g, "").slice(0, TAMANHO);
    setSenha(digitos);
    if (erro) setErro("");
  }

  function validar(event) {
    event.preventDefault();
    const resultado = validarSenhaTemporaria(senha);
    if (!resultado.ok) {
      setErro("Digite os 6 dígitos da senha temporária.");
      campo.current?.focus();
      return;
    }
    router.push("/senha/validada");
  }

  return (
    <Screen variant="senha">
      <form
        onSubmit={validar}
        className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-xl flex-col px-6 py-6 md:max-w-2xl md:px-8 md:py-8"
      >
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full px-1 py-2 text-base font-extrabold text-ink"
        >
          <IconArrowLeft />
          Voltar
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center pb-8">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-brand shadow-sm md:h-20 md:w-20">
            <IconLock className="h-8 w-8 md:h-9 md:w-9" />
          </span>
          <h1 className="mt-5 text-center text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Digite sua senha temporária
          </h1>
          <p className="mt-2 max-w-md text-center text-sm font-semibold text-muted md:text-base">
            A senha foi enviada após a confirmação da compra.
          </p>

          <div
            className={`relative mt-8 w-full max-w-lg ${erro ? "animate-shake" : ""}`}
            onClick={() => campo.current?.focus()}
          >
            <div className="grid grid-cols-6 gap-2 md:gap-3">
              {Array.from({ length: TAMANHO }).map((_, index) => {
                const preenchido = index < senha.length;
                const ativo = index === senha.length;
                return (
                  <div
                    key={index}
                    className={`grid h-14 place-items-center rounded-2xl border-2 bg-white text-2xl font-extrabold text-ink shadow-sm md:h-[4.5rem] md:text-3xl ${
                      erro
                        ? "border-danger"
                        : ativo
                          ? "border-brand"
                          : "border-ink/10"
                    }`}
                  >
                    {preenchido ? "•" : ""}
                  </div>
                );
              })}
            </div>
            <input
              ref={campo}
              value={senha}
              onChange={(event) => aoDigitar(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Senha temporária de 6 dígitos"
              className="absolute inset-0 cursor-pointer opacity-0"
              autoFocus
            />
          </div>

          <p className="mt-5 flex w-full max-w-lg items-start gap-3 rounded-2xl bg-peach px-4 py-3 text-sm font-bold text-warn md:text-base">
            <IconAlert className="mt-0.5 shrink-0" />
            A senha é válida para apenas uma retirada.
          </p>
          {erro ? (
            <p className="mt-3 text-sm font-bold text-danger" role="alert">
              {erro}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 inline-flex h-14 w-full max-w-lg items-center justify-center gap-2 rounded-2xl bg-brand text-base font-extrabold text-white shadow-[0_10px_24px_rgba(27,143,76,0.22)] transition hover:bg-brand-dark md:h-16 md:text-lg"
          >
            Validar senha
            <IconArrowRight />
          </button>
        </div>

        <p className="mb-10 flex items-center justify-center gap-2 text-center text-sm font-bold text-muted md:text-base">
          <IconHelp className="text-brand" />
          <span>
            Problemas com a senha?
            <span className="mt-0.5 block font-semibold">Procure um atendente.</span>
          </span>
        </p>
      </form>
    </Screen>
  );
}
