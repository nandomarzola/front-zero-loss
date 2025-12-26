export interface ItemCalculado {
  id: string;
  produto: string;
  variacao: string;
  quantidade: number;
  precoVendaUnitario: number;
  cmvUnitario: number;
  lucroUnitario: number;
  lucroFinal: number;
  margem: number;
  taxasTotais: number;
}