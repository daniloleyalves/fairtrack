export interface ReportFilters {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  category?: string[];
  origin?: string[];
  company?: string[];
  fairteiler?: string[];
}

export type StringFilterKeys = 'category' | 'origin' | 'company' | 'fairteiler';
