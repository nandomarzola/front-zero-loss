import { Injectable } from '@angular/core';
import { ItemCalculado } from '@core/models/produto';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly TAXA_SHOPEE = 0.20; 
  private readonly TAXA_FIXA = 4.00;

  calcularItem(item: Partial<ItemCalculado>, impostos: number, embalagem: number): ItemCalculado {
    const vUn = item.precoVendaUnitario || 0;
    const cUn = item.cmvUnitario || 0;
    const qtd = item.quantidade || 0;

    const valorImposto = vUn * (impostos / 100);
    const comissaoShopee = vUn * this.TAXA_SHOPEE;
    
    const taxasTotais = valorImposto + comissaoShopee + this.TAXA_FIXA;
    const lucroUnitario = vUn - taxasTotais - cUn - embalagem;

    return {
      ...item as ItemCalculado,
      taxasTotais,
      lucroUnitario,
      lucroFinal: lucroUnitario * qtd,
      margem: vUn > 0 ? (lucroUnitario / vUn) * 100 : 0
    };
  }
}