import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceiroService } from '@services/financeiro';
import { DataService } from '@services/data';
import { ItemCalculado } from '@models/produto';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.scss'
})
export class Calculadora {
  private finService = inject(FinanceiroService);
  private dataService = inject(DataService);

  itens = signal<ItemCalculado[]>([]);
  regime = signal<'ISENTO' | 'VARIAVEL'>('ISENTO');
  aliquota = signal(0);
  embalagem = signal(0);
  devolucoes = signal(0);

  totalVendido = computed(() => 
    this.itens().reduce((acc, curr) => acc + curr.quantidade, 0)
  );

  lucroTotal = computed(() => {
    const lucroVendas = this.itens().reduce((acc, curr) => acc + curr.lucroFinal, 0);
    return lucroVendas - (this.devolucoes() * this.embalagem());
  });

  recalcular() {
    this.itens.update(lista => lista.map(item => {
      const imposto = this.regime() === 'VARIAVEL' ? this.aliquota() : 0;
      const novoCalculo = this.finService.calcularItem(item, imposto, this.embalagem());
      return { ...item, ...novoCalculo };
    }));
  }

  trackByFn(index: number, item: ItemCalculado) {
    return `${item.produto}-${item.variacao}`;
  }
}