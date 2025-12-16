import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

  return (
    <div className="flex flex-col gap-3">
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

      {/* Table */}
      <ScrollArea className="w-full">
        <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Empty corner cell */}
                <th className="sticky left-0 z-10 bg-card border border-border/50 p-1 min-w-[150px]">
                  <span className="text-xs text-muted-foreground">Rad / Kolumn</span>
                </th>
                {/* Column headers */}
                {columns.map((col, colIndex) => (
                  <th key={colIndex} className="border border-border/50 p-1 min-w-[80px]">
                    <div className="flex items-center gap-1">
                      <Input
                        value={col}
                        onChange={(e) => handleColumnChange(colIndex, e.target.value)}
                        className="h-7 text-xs font-medium bg-background/50 border-0 p-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeColumn(colIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </th>
                ))}
                {/* Add column button */}
                <th className="border border-border/50 p-1 w-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={addColumn}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Row label */}
                  <td className="sticky left-0 z-10 bg-card border border-border/50 p-1">
                    <div className="flex items-center gap-1">
                      <Input
                        value={row.row_label}
                        onChange={(e) => handleRowLabelChange(rowIndex, e.target.value)}
                        className="h-7 text-xs font-medium bg-background/50 border-0 p-1"
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
                    <td key={colIndex} className="border border-border/50 p-1">
                      <Input
                        value={value || ""}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="h-7 text-xs text-center font-mono bg-background/50 border-0 p-1"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  {/* Empty cell for alignment */}
                  <td className="border border-border/50 p-1 w-10"></td>
                </tr>
              ))}
              {/* Add row button */}
              <tr>
                <td className="sticky left-0 z-10 bg-card border border-border/50 p-1">
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
                <td colSpan={columns.length + 1} className="border border-border/50"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
