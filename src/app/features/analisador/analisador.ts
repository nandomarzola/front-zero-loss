import { Component, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { DataService, FinanceiroService } from '@core/services';
@Component({
  selector: 'app-analisador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analisador.html',
  styleUrl: './analisador.scss'
})
export class Analisador {
  private finService = inject(FinanceiroService);
  private dataService = inject(DataService);
  private cdr = inject(ChangeDetectorRef);

  abaAtiva: 'CALCULADORA' | 'DASHBOARD' = 'CALCULADORA';
  dadosProcessados = signal<any[]>([]); 
  
  totalLucro = 0;
  totalItensVendidos = 0;
  regimeSelecionado = 'ISENTO';
  aliquotaInformada = 0;
  custoEmbalagem = 0;
  qtdDevolucoes = 0;
  totalBruto = 0;

  uploadArquivo(event: any) {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const livro = XLSX.read(data, { type: 'array' });
    
    const nomePrimeiraAba = livro.SheetNames[0];
    const dadosBrutos = XLSX.utils.sheet_to_json(livro.Sheets[nomePrimeiraAba]);
    
    this.processarDados(dadosBrutos);
  };
  leitor.readAsArrayBuffer(arquivo);
}

  processarDados(lista: any[]) {
    const temp: any[] = [];
    lista.forEach(item => {
      const nomeProduto = item['Produto'] || item['Nome do produto'];
      const varNome = item['Nome da Variação'] || item['Variation Name'];
      const qtd = parseInt(item['Unidades (Pedido pago)'] || item['Unidades'] || 0);

      if (qtd > 0) {
        const temFilhosComVariacao = lista.some(i => 
          (i['Produto'] === nomeProduto || i['Nome do produto'] === nomeProduto) && 
          (i['Nome da Variação'] && i['Nome da Variação'] !== '-' && i['Nome da Variação'] !== '')
        );
        if (!((!varNome || varNome === '-') && temFilhosComVariacao)) {
          const variacao = (varNome && varNome !== '-') ? varNome : 'Anúncio Único';
          const cmvSalvo = this.dataService.obterCusto(nomeProduto, variacao) || 0;

          temp.push({
            produto: nomeProduto,
            variacao: variacao,
            quantidade: qtd,
            precoVendaUnitario: 0,
            cmvUnitario: cmvSalvo
          });
        }
      }
    });
    this.dadosProcessados.set(temp.sort((a, b) => a.produto.localeCompare(b.produto)));
    this.recalcular();
  }

  recalcular() {
    let lucroSomaVendas = 0;
    let unidadesTotais = 0;
    let faturamentoSoma = 0;

    const impostoPercent = this.regimeSelecionado === 'VARIAVEL' ? this.aliquotaInformada : 0;
    const listaAtual = this.dadosProcessados();

    listaAtual.forEach(item => {
        const calculado = this.finService.calcularItem(item, impostoPercent, this.custoEmbalagem);
        Object.assign(item, calculado);

        lucroSomaVendas += item.lucroFinal;
        unidadesTotais += item.quantidade;
        faturamentoSoma += (item.precoVendaUnitario * item.quantidade);
    });

    this.totalItensVendidos = unidadesTotais;
    this.totalBruto = faturamentoSoma;
    this.totalLucro = lucroSomaVendas; 
    
    this.dataService.produtos.set([...listaAtual]);
    this.cdr.detectChanges();
    }
  aoMudarCMV(item: any) {
    this.dataService.salvarCusto(item.produto, item.variacao, item.cmvUnitario);
    this.recalcular();
  }

  getMargemColor(margem: number): string {
    if (margem >= 20) return '#059669';
    if (margem >= 10) return '#10b981';
    if (margem > 0) return '#f59e0b';
    return '#ef4444';
  }

  imprimir() { window.print(); }
}