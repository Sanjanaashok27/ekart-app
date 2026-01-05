
export interface Product {
  id: number | string;
  name?: string;
  title?: string;
  price: number;
  category?: string;
  department?: string;
  description?: string;

  image?: string;
  thumbnail?: string;

  productId?: string | number;
  sku?: string | number;

  source: 'api' | 'local';
}
