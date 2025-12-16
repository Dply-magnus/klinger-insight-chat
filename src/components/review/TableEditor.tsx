import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TableEditorProps {
  columns: string[];
  rows: { row_label: string; values: (string | null)[] }[];
  legend: Record<string, string>;
  onChange: (columns: string[], rows: { row_label: string; values: (string | null)[] }[]) => void;
}

export function TableEditor({ columns, rows, legend, onChange }: TableEditorProps) {
  const handleColumnChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    onChange(newColumns, rows);
  };

  const handleRowLabelChange = (rowIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], row_label: value };
    onChange(columns, newRows);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    const newValues = [...newRows[rowIndex].values];
    newValues[colIndex] = value || null;
    newRows[rowIndex] = { ...newRows[rowIndex], values: newValues };
    onChange(columns, newRows);
  };

  const addColumn = () => {
    const newColumns = [...columns, `Kolumn ${columns.length + 1}`];
    const newRows = rows.map(row => ({
      ...row,
      values: [...row.values, null]
    }));
    onChange(newColumns, newRows);
  };

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return;
    const newColumns = columns.filter((_, i) => i !== index);
    const newRows = rows.map(row => ({
      ...row,
      values: row.values.filter((_, i) => i !== index)
    }));
    onChange(newColumns, newRows);
  };

  const addRow = () => {
    const newRow = {
      row_label: `Rad ${rows.length + 1}`,
      values: columns.map(() => null)
    };
    onChange(columns, [...rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(columns, rows.filter((_, i) => i !== index));
  };

  const legendEntries = Object.entries(legend);

  // Visar hela kolumnnamn (ingen trunkering)

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      {/* Legend */}
      {legendEntries.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Teckenförklaring:</p>
          <div className="flex flex-wrap gap-3">
            {legendEntries.map(([key, value]) => (
              <span key={key} className="text-xs">
                <span className="font-mono font-bold text-primary">{key}</span>
                <span className="text-muted-foreground"> = {value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table with sticky first column and horizontal scroll */}
      <div className="relative border border-border/50 rounded-lg w-full overflow-hidden">
        <div 
          className="overflow-x-auto overflow-y-auto max-h-[400px]"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--muted-foreground) / 0.5) hsl(var(--muted) / 0.3)'
          }}
        >
          <table 
            className="border-collapse"
            style={{ 
              width: `${180 + columns.length * 60 + 40}px`,
              minWidth: `${180 + columns.length * 60 + 40}px`
            }}
          >
            <thead>
              <tr>
                {/* Sticky corner cell */}
                <th className="sticky left-0 z-20 bg-card border-r border-b border-border/50 p-2 min-w-[180px] w-[180px]">
                  <span className="text-xs text-muted-foreground">Rad / Kolumn</span>
                </th>
                {/* Column headers with popover */}
                {columns.map((col, colIndex) => (
                  <th key={colIndex} className="border-b border-r border-border/50 p-1 w-[60px] min-w-[60px] h-[120px] align-bottom overflow-hidden">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Redigera kolumn: ${col}`}
                          className="relative w-full h-full flex items-end justify-center text-xs font-medium hover:text-primary transition-colors group"
                        >
                          <span 
                            className="whitespace-nowrap [writing-mode:vertical-lr] rotate-180 max-h-[110px] overflow-hidden text-ellipsis"
                          >
                            {col}
                          </span>
                          <Pencil className="absolute top-1 right-0 h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="center">
                        <div className="flex flex-col gap-2">
                          <Input
                            value={col}
                            onChange={(e) => handleColumnChange(colIndex, e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 justify-start gap-1"
                            onClick={() => removeColumn(colIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Ta bort kolumn
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </th>
                ))}
                {/* Add column button */}
                <th className="border-b border-border/50 p-1 w-10 min-w-[40px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={addColumn}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Sticky row label - full width, no truncation */}
                  <td className="sticky left-0 z-10 bg-card border-r border-b border-border/50 p-1 min-w-[180px] w-[180px]">
                    <div className="flex items-center gap-1">
                      <Input
                        value={row.row_label}
                        onChange={(e) => handleRowLabelChange(rowIndex, e.target.value)}
                        className="h-7 text-xs font-medium bg-background/50 border-0 p-1 flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  {/* Cell values */}
                  {row.values.map((value, colIndex) => (
                    <td key={colIndex} className="border-b border-r border-border/50 p-1 w-[60px] min-w-[60px]">
                      <Input
                        value={value || ""}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="h-7 w-full text-xs text-center font-mono bg-background/50 border-0 p-0.5"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  {/* Empty cell for alignment */}
                  <td className="border-b border-border/50 p-1 w-10"></td>
                </tr>
              ))}
              {/* Add row button */}
              <tr>
                <td className="sticky left-0 z-10 bg-card border-r border-border/50 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full text-xs text-muted-foreground hover:text-primary gap-1"
                    onClick={addRow}
                  >
                    <Plus className="h-3 w-3" />
                    Lägg till rad
                  </Button>
                </td>
                <td colSpan={columns.length + 1} className="border-border/50"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
