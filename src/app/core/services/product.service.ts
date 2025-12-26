import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { environment } from '@env/environment';
import { Product } from '@core/models/products';

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/products`;

  getProducts(): Observable<ApiResponse<Product[]>> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return this.http.get<ApiResponse<Product[]>>(this.apiUrl, {
        headers: this.getHeaders(token)
      });
    }
    return of({ status: 'success', data: [] });
  }

  importProducts(file: File): Observable<ApiResponse<any>> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      return this.http.post<ApiResponse<any>>(`${this.apiUrl}/import`, formData, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        })
      });
    }
    return of({ status: 'error', data: null });
  }

  updateProduct(id: string | number, data: Partial<Product>): Observable<ApiResponse<Product>> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      
      return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, data, {
        headers: this.getHeaders(token)
      });
    }
    return of({ status: 'error', data: {} as Product });
  }

  /**
   * Centraliza a criação de Headers para evitar repetição
   */
  private getHeaders(token: string | null): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });
  }
}