import { TaxConfigurationService, TaxConfiguration } from '@core/services/tax-configuration.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '@core/models/products';
import { ProductService } from '@core/services/product.service';

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

  /**
   * Carrega primeiro as taxas e depois os produtos para garantir
   * que o cálculo de margem tenha os dados necessários.
   */
  loadInitialData() {
    this.isLoading.set(true);
    
    this.taxService.get('shopee').subscribe({
      next: (response) => {
        this.taxConfig.set(response.data);
        this.loadProducts();
      },
      error: (err) => {
        console.error('Erro ao carregar configurações de taxas:', err);
        this.loadProducts(); 
      }
    });
  }

  /**
   * Realiza o cálculo dinâmico baseado no TaxConfiguration vindo do banco.
   */
  recalcularItem(item: Product) {
    const config = this.taxConfig();
    
    if (!item.sale_price || item.sale_price <= 0 || !config) {
      item.margin_percentage = 0;
      item.margin_amount = 0;
      return;
    }

    const comissao = item.sale_price * (config.commission_rate / 100);
    const imposto = item.sale_price * (config.tax_rate / 100);
    
    const custosFixos = Number(config.fixed_fee) + Number(config.packaging_cost);
    
    const custoAquisicao = Number(item.cost_price || 0);

    const lucroUnitario = item.sale_price - (comissao + imposto + custosFixos + custoAquisicao);
    
    item.margin_percentage = (lucroUnitario / item.sale_price) * 100;
    item.margin_amount = lucroUnitario * (item.stock || 0);
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        const productsList = response.data || response || [];      
        
        productsList.forEach((item: Product) => {
          this.recalcularItem(item);
        });

        this.products.set(productsList);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.isLoading.set(false);
      }
    });
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
      next: () => console.log(`Produto ${item.id} atualizado com sucesso!`),
      error: (err) => alert('Erro ao salvar alterações.')
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isLoading.set(true);
      this.productService.importProducts(file).subscribe({
        next: () => {
          event.target.value = ''; 
          this.loadProducts();
        },
        error: (err) => {
          console.error('Erro na importação:', err);
          this.isLoading.set(false);
          alert('Erro ao importar planilha.');
        }
      });
    }
  }

  getMargemColor(margem: number): string {
    if (margem >= 20) return '#10b981';
    if (margem >= 10) return '#f59e0b';
    return '#ef4444';
  }
}