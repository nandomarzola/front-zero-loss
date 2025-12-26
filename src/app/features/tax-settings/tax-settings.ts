import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaxConfigurationService, TaxConfiguration } from '@core/services/tax-configuration.service';

@Component({
  selector: 'app-tax-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax-settings.html',
  styleUrl: './tax-settings.scss'
})
export class TaxSettings implements OnInit {
  private taxService = inject(TaxConfigurationService);
  
  isLoading = signal(false);
  isSaving = signal(false);
  
  config = signal<TaxConfiguration>({
    platform: 'shopee',
    commission_rate: 0,
    fixed_fee: 0,
    tax_rate: 0,
    packaging_cost: 0
  });

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading.set(true);
    this.taxService.get('shopee').subscribe({
      next: (res) => {
        if (res && res.data) {
          this.config.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar configurações:', err);
        this.isLoading.set(false);
      }
    });
  }


  save() {
    this.isSaving.set(true);
    
    this.taxService.save(this.config()).subscribe({
      next: () => {
        this.isSaving.set(false);
        alert('Configurações salvas com sucesso!');
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Erro ao salvar:', err);
        alert('Erro ao salvar configurações.');
      }
    });
  }

  updateField(field: keyof TaxConfiguration, value: any) {
    this.config.update(prev => ({
      ...prev,
      [field]: value
    }));
  }
}