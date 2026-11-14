export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: 'PLN' | 'EUR' | 'USD';
  categoryId: string;
}
