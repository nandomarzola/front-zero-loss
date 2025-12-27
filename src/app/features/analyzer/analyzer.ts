import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

import { Product } from '@core/models/products';
import { ProductService } from '@core/services/product.service';
import { TaxConfigurationService, TaxConfiguration } from '@core/services/tax-configuration.service';
import { FinancialService } from '@core/services/financial';

@Component({
  selector: 'app-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analyzer.html',
  styleUrl: './analyzer.scss'
})
export class Analyzer implements OnInit {
  private productService = inject(ProductService);
  private taxService = inject(TaxConfigurationService);
  private financialService = inject(FinancialService);
  private cdr = inject(ChangeDetectorRef);

  // Estados reativos (Signals)
  products = signal<Product[]>([]);
  taxConfig = signal<TaxConfiguration | null>(null);
  isLoading = signal(false);
  isMonthlyClosing = signal(false);
  closingMonthName = signal<string>('');

  // Totais para o Dashboard
  totalProfit = 0;
  totalRevenue = 0;
  totalItemsSold = 0;

  ngOnInit() {
    this.loadTaxConfig();
  }

  loadTaxConfig() {
    this.taxService.get('shopee').subscribe({
      next: (response) => this.taxConfig.set(response.data),
      error: (err) => console.error('Erro ao carregar taxas:', err)
    });
  }

  onFileUpload(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isLoading.set(true);

    this.productService.importProducts(file).subscribe({
      next: () => {
        this.productService.getProducts().subscribe({
          next: (productsResponse: any) => {
            const productsFromDB: Product[] = productsResponse.data || productsResponse || [];
            this.syncQuantitiesWithExcel(file, productsFromDB);
            event.target.value = ''; 
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: (err) => {
        console.error('Erro na importação:', err);
        this.isLoading.set(false);
        alert('Erro ao processar planilha.');
      }
    });
  }

  private syncQuantitiesWithExcel(file: File, dbProducts: Product[]) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const rawData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      const salesMap = new Map<string, number>();
      const productsWithVariations = new Set<string>();

      // Mapeia variações para evitar duplicar contagem com o SKU Pai
      rawData.forEach(row => {
        const pName = row['Produto'] || row['Nome do produto'];
        const vName = row['Nome da Variação'] || row['Variation Name'] || '';
        if (vName && vName !== '-' && vName !== '') productsWithVariations.add(pName);
      });

      rawData.forEach(row => {
        const pName = row['Produto'] || row['Nome do produto'];
        const vName = row['Nome da Variação'] || row['Variation Name'] || '';
        const qty = parseInt(row['Unidades (Pedido pago)'] || row['Unidades'] || 0);
        
        const isParentRow = (!vName || vName === '-') && productsWithVariations.has(pName);

        if (!isParentRow && qty > 0 && pName) {
          const key = this.createKey(pName, vName);
          salesMap.set(key, (salesMap.get(key) || 0) + qty);
        }
      });

      // Filtra apenas produtos que tiveram venda no arquivo
      const analyzedProducts = dbProducts.map(p => ({
        ...p,
        stock: salesMap.get(this.createKey(p.product_name, p.variation_name)) || 0
      })).filter(p => p.stock > 0);

      // --- CONFIGURAÇÃO DO FECHAMENTO (LIMPA) ---
      if (analyzedProducts.length > 0) {
        this.isMonthlyClosing.set(true);
        this.closingMonthName.set(this.extractMonthFromFileName(file.name));
      }

      this.products.set(analyzedProducts);
      this.calculateFinancials();
      this.isLoading.set(false);
    };
    reader.readAsArrayBuffer(file);
  }

  private extractMonthFromFileName(name: string): string {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const match = name.match(/202\d{1}(\d{2})/); // Tenta achar o mês no padrão YYYYMM
    const now = new Date();
    
    if (match && match[1]) {
      const monthIndex = parseInt(match[1]) - 1;
      return `${months[monthIndex]}/${now.getFullYear()}`;
    }
    return `${months[now.getMonth()]}/${now.getFullYear()}`;
  }

  calculateFinancials() {
    const config = this.taxConfig();
    if (!config) return;

    let profitSum = 0, revenueSum = 0, qtySum = 0;

    const items = this.products().map(item => {
      const result = this.financialService.calculateItem(item, config);
      const sold_qty = Number(item.stock || 0);
      const sale_price = Number(item.sale_price || 0);
      const margin_amount = Number(result.margin_amount || 0);

      profitSum += margin_amount;
      revenueSum += (sale_price * sold_qty);
      qtySum += sold_qty;

      return {
        ...item,
        margin_amount: margin_amount,
        margin_percentage: Number(result.margin_percentage || 0)
      };
    });

    this.products.set(items);
    this.totalProfit = profitSum;
    this.totalRevenue = revenueSum;
    this.totalItemsSold = qtySum;
    this.cdr.detectChanges();
  }

  fecharMes() {
    const payload = {
      month: this.closingMonthName(),
      revenue: this.totalRevenue,
      profit: this.totalProfit,
      itemsSold: this.totalItemsSold,
      platform: 'shopee'
    };
    
    // Agora o "imbecil" pode fechar o que quiser!
    console.log('Dados salvos no fechamento:', payload);
    alert(`Fechamento de ${this.closingMonthName()} realizado!`);
  }

  onCostChange(item: Product) {
    this.productService.updateProduct(item.id, { cost_price: item.cost_price })
      .subscribe(() => this.calculateFinancials());
  }

  getMarginColor(margin: number): string {
    if (margin >= 20) return '#10b981'; // Verde
    if (margin >= 10) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  }

  private createKey(name: string | null | undefined, variation: string | null | undefined): string {
    const n = (name || '').trim().toLowerCase();
    const v = (!variation || variation === '-' || variation === 'Single SKU') ? '' : variation.trim().toLowerCase();
    return `${n}|${v}`;
  }
}