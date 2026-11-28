/** Dados de demonstração no formato da conta, do passe e do extrato. */

export const alunoDemo = {
  nome: "Lara Moreira Barreto",
  primeiroNome: "Lara",
  matricula: "112345678",
  saldoCentavos: 3550,
  refeicoesDisponiveis: 5,
  ultimaRecarga: {
    valorCentavos: 3550,
    meio: "PIX",
    quando: "10/11/2024 às 14:32",
  },
  movimentacoes: [
    { id: "1", data: "10/11/2024", descricao: "Almoço", valorCentavos: -710 },
    { id: "2", data: "09/11/2024", descricao: "Recarga PIX", valorCentavos: 3550 },
    { id: "3", data: "08/11/2024", descricao: "Almoço", valorCentavos: -710 },
    { id: "4", data: "05/11/2024", descricao: "Recarga PIX", valorCentavos: 7100 },
    { id: "5", data: "03/11/2024", descricao: "Almoço", valorCentavos: -710 },
  ],
};

export function formatarReais(centavos) {
  return (Math.abs(centavos) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function validarSenhaTemporaria(senha) {
  return { ok: /^\d{6}$/.test(senha) };
}
