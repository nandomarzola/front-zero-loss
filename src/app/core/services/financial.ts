import { Injectable } from '@angular/core';
import { TaxConfiguration } from './tax-configuration.service';
import { Product } from '@core/models/products';

@Injectable({ providedIn: 'root' })

export class FinancialService {
  /**
   * @param item The Product object (using stock as quantity)
   * @param config The TaxConfiguration object from your API
   * @param extraPackaging Manual adjustment for packaging
   */
  calculateItem(item: Product, config: TaxConfiguration, extraPackaging: number = 0) {
    const salePrice = Number(item.sale_price || 0);
    const costPrice = Number(item.cost_price || 0);
    const quantity = Number(item.stock || 0);

    if (salePrice <= 0 || !config) {
      return { margin_amount: 0, margin_percentage: 0 };
    }

    const commission = salePrice * (config.commission_rate / 100);
    const tax = salePrice * (config.tax_rate / 100);
    const fixedFee = Number(config.fixed_fee || 0);
    const totalPackaging = Number(extraPackaging || 0);

    const netProfitUnit = salePrice - (commission + tax + fixedFee + totalPackaging + costPrice);
    
    return {
      margin_amount: netProfitUnit * quantity,
      margin_percentage: (netProfitUnit / salePrice) * 100
    };
  }
}