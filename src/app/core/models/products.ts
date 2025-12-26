export interface Product {
  id: string;
  product_name: string;
  variation_name?: string;
  sku: string;
  stock: number;
  cost_price: number;
  id_variation?:  string;
  sale_price: number;
  margin_amount: number;
  margin_percentage: number;
  
  active?: boolean;
}