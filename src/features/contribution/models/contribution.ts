import { v4 as uuidv4 } from 'uuid';

export interface ContributionItem {
  id: string;
  quantity: number;
  foodId: string;
  title: string;
  originId: string;
  categoryId: string;
  companyId: string | null;
  company: string | null;
  cool: boolean;
  shelfLife: Date | null;
  allergens: string | null;
  comment: string | null;
}

export function createContributionItem(): ContributionItem {
  return {
    id: uuidv4(),
    foodId: uuidv4(),
    quantity: 0,
    title: '',
    originId: '',
    categoryId: '',
    companyId: null,
    company: null,
    cool: false,
    shelfLife: null,
    allergens: null,
    comment: null,
  };
}
