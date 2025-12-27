import { Product } from './products';

export interface SaleItem extends Partial<Product> {
  productName: string;
  variationName?: string; 
  
  quantity: number; 
  
  totalGross?: number;
  totalNetProfit?: number; 
}