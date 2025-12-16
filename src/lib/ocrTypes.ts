export interface TableColumn {
  group: string | null;
  label: string;
}

export interface TableRow {
  category: string;
  row_label: string;
  values: (string | null)[];
}

export interface OCRJsonContent {
  meta: {
    filename: string;
    page_number: number;
  };
  page_context: string;
  legend: Record<string, string>;
  table: {
    has_table: boolean;
    columns: TableColumn[];
    rows: TableRow[];
  };
}

export function parseOCRContent(content: string | null): OCRJsonContent | null {
  if (!content) return null;
  
  try {
    return JSON.parse(content) as OCRJsonContent;
  } catch {
    return null;
  }
}

export function stringifyOCRContent(data: OCRJsonContent): string {
  return JSON.stringify(data, null, 2);
}
