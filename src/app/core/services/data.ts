import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataService {
  public produtos = signal<any[]>([]);
  
  public custosSalvos = signal<Record<string, number>>({});

  salvarCusto(produto: string, variacao: string, valor: number) {
    const chave = `${produto}_${variacao}`;
    const novosCustos = { ...this.custosSalvos(), [chave]: valor };
    this.custosSalvos.set(novosCustos);
  }

  obterCusto(produto: string, variacao: string): number | null {
    const chave = `${produto}_${variacao}`;
    return this.custosSalvos()[chave] || null;
  }
}