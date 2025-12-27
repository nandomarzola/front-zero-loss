import { TaxConfigurationService, TaxConfiguration } from '@core/services/tax-configuration.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '@core/models/products';
import { ProductService } from '@core/services/product.service';
import * as XLSX from 'xlsx'; // Importamos para validar o arquivo antes de enviar

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private taxService = inject(TaxConfigurationService);
  
  products = signal<Product[]>([]);
  taxConfig = signal<TaxConfiguration | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading.set(true);
    this.taxService.get('shopee').subscribe({
      next: (response) => {
        this.taxConfig.set(response.data);
        this.loadProducts();
      },
      error: (err) => {
        console.error('Erro ao carregar taxas:', err);
        this.loadProducts(); 
      }
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        let productsList: Product[] = response.data || response || [];      
        
        // REGRA DE OURO: Filtrar produtos "Pai" que podem ter vindo do banco por erro anterior
        // Se o produto tem variação vazia/Single SKU, mas existem outros produtos com o mesmo nome e variações reais, removemos o pai.
        productsList = this.filterParentProducts(productsList);

        productsList.forEach((item: Product) => {
          this.recalcularItem(item);
        });

        this.products.set(productsList);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Remove da lista produtos que são apenas "cabeçalhos" (pais) 
   * quando existem variações reais para aquele mesmo nome.
   */
  private filterParentProducts(list: Product[]): Product[] {
    const namesWithVariations = new Set(
      list
        .filter(p => p.variation_name && p.variation_name !== 'Single SKU' && p.variation_name !== '-')
        .map(p => p.product_name)
    );

    return list.filter(p => {
      const isParent = !p.variation_name || p.variation_name === 'Single SKU' || p.variation_name === '-';
      const hasChildren = namesWithVariations.has(p.product_name);
      return !(isParent && hasChildren); // Retorna falso se for pai E tiver filhos
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isLoading.set(true);

    // Dica: Você pode implementar aqui uma pré-leitura com XLSX para avisar
    // ao usuário se ele está tentando subir algo inválido, mas o ideal
    // é que o importProducts no service já lide com o FormData.
    
    this.productService.importProducts(file).subscribe({
      next: () => {
        event.target.value = ''; 
        this.loadProducts(); // Recarrega a lista já aplicando o filtro acima
      },
      error: (err) => {
        console.error('Erro na importação:', err);
        this.isLoading.set(false);
        alert('Erro ao importar planilha.');
      }
    });
  }

  recalcularItem(item: Product) {
    const config = this.taxConfig();
    if (!item.sale_price || item.sale_price <= 0 || !config) {
      item.margin_percentage = 0;
      item.margin_amount = 0;
      return;
    }

    const comissao = Number(item.sale_price) * (config.commission_rate / 100);
    const imposto = Number(item.sale_price) * (config.tax_rate / 100);
    const custosFixos = Number(config.fixed_fee) + Number(config.packaging_cost);
    const custoAquisicao = Number(item.cost_price || 0);

    const lucroUnitario = item.sale_price - (comissao + imposto + custosFixos + custoAquisicao);
    
    item.margin_percentage = (lucroUnitario / item.sale_price) * 100;
    item.margin_amount = lucroUnitario * (item.stock || 0);
  }

  salvarAlteracoes(item: Product) {
    this.recalcularItem(item);
    this.productService.updateProduct(item.id, {
      sale_price: item.sale_price,
      cost_price: item.cost_price,
      stock: item.stock,
      margin_amount: item.margin_amount,
      margin_percentage: item.margin_percentage
    }).subscribe({
      next: () => console.log('Atualizado!'),
      error: () => alert('Erro ao salvar.')
    });
  }

  getMargemColor(margem: number): string {
    if (margem >= 20) return '#10b981';
    if (margem >= 10) return '#f59e0b';
    return '#ef4444';
  }
}