import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Product } from '@core/models/products';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/products`;

  getCosts(): Observable<{ status: string, data: Product[] }> {
    return this.http.get<{ status: string, data: Product[] }>(`${this.API_URL}/costs`);
  }

  saveCost(data: Product): Observable<any> {
    return this.http.post(`${this.API_URL}/cost`, data);
  }

  updateProduct(id: string, data: Partial<Product>): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, data);
  }
}