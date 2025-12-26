import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface TaxConfiguration {
  id?: string;
  platform: string;
  commission_rate: number;
  fixed_fee: number;
  tax_rate: number;
  packaging_cost: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaxConfigurationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tax-settings`;

  get(platform: string = 'shopee'): Observable<{ data: TaxConfiguration }> {
    return this.http.get<{ data: TaxConfiguration }>(`${this.apiUrl}/${platform}`);
  }

  save(config: TaxConfiguration): Observable<any> {
    return this.http.post(this.apiUrl, config);
  }
}