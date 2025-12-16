import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TableColumn, TableRow } from "@/lib/ocrTypes";

interface TableEditorProps {
  columns: TableColumn[];
  rows: TableRow[];
  legend: Record<string, string>;
  onChange: (columns: TableColumn[], rows: TableRow[]) => void;
}

export function TableEditor({ columns, rows, legend, onChange }: TableEditorProps) {
  // Group columns by their group header
  const columnGroups = useMemo(() => {
    const groups: { group: string | null; startIndex: number; count: number }[] = [];
    let currentGroup: string | null = null;
    let startIndex = 0;
    
    columns.forEach((col, index) => {
      if (col.group !== currentGroup) {
        if (index > 0) {
          groups.push({ group: currentGroup, startIndex, count: index - startIndex });
        }
        currentGroup = col.group;
        startIndex = index;
      }
    });
    
    // Add the last group
    if (columns.length > 0) {
      groups.push({ group: currentGroup, startIndex, count: columns.length - startIndex });
    }
    
    return groups;
  }, [columns]);

  // Group rows by category
  const rowGroups = useMemo(() => {
    const groups: { category: string; startIndex: number; count: number }[] = [];
    let currentCategory = "";
    let startIndex = 0;
    
    rows.forEach((row, index) => {
      if (row.category !== currentCategory) {
        if (index > 0) {
          groups.push({ category: currentCategory, startIndex, count: index - startIndex });
        }
        currentCategory = row.category;
        startIndex = index;
      }
    });
    
    // Add the last group
    if (rows.length > 0) {
      groups.push({ category: currentCategory, startIndex, count: rows.length - startIndex });
    }
    
    return groups;
  }, [rows]);

  const handleColumnLabelChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], label: value };
    onChange(newColumns, rows);
  };

  const handleColumnGroupChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], group: value || null };
    onChange(newColumns, rows);
  };

  const handleRowLabelChange = (rowIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], row_label: value };
    onChange(columns, newRows);
  };

  const handleRowCategoryChange = (rowIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], category: value };
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
    const lastGroup = columns.length > 0 ? columns[columns.length - 1].group : null;
    const newColumn: TableColumn = { group: lastGroup, label: `Kolumn ${columns.length + 1}` };
    const newRows = rows.map(row => ({
      ...row,
      values: [...row.values, null]
    }));
    onChange([...columns, newColumn], newRows);
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
    const lastCategory = rows.length > 0 ? rows[rows.length - 1].category : "";
    const newRow: TableRow = {
      category: lastCategory,
      row_label: `Rad ${rows.length + 1}`,
      values: columns.map(() => null)
    };
    onChange(columns, [...rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(columns, rows.filter((_, i) => i !== index));
  };

  const legendEntries = Object.entries(legend || {});

  // Check if first row in its category
  const isFirstInCategory = (rowIndex: number): boolean => {
    if (rowIndex === 0) return true;
    return rows[rowIndex].category !== rows[rowIndex - 1].category;
  };

  // Count rows in same category starting from this row
  const getCategoryRowCount = (rowIndex: number): number => {
    const category = rows[rowIndex].category;
    let count = 0;
    for (let i = rowIndex; i < rows.length && rows[i].category === category; i++) {
      count++;
    }
    return count;
  };

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
          className="overflow-x-auto overflow-y-auto max-h-[500px]"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--muted-foreground) / 0.5) hsl(var(--muted) / 0.3)'
          }}
        >
          <table 
            className="border-collapse"
            style={{ 
              width: `${100 + 180 + columns.length * 60 + 40}px`,
              minWidth: `${100 + 180 + columns.length * 60 + 40}px`
            }}
          >
            <thead>
              {/* Group header row */}
              <tr>
                <th className="sticky left-0 z-20 bg-card border-r border-b border-border/50 p-1" colSpan={2}>
                  <span className="text-xs text-muted-foreground">Grupp</span>
                </th>
                {columnGroups.map((group, groupIndex) => (
                  <th 
                    key={groupIndex} 
                    colSpan={group.count}
                    className="border-b border-r border-border/50 p-2 text-xs font-semibold text-center bg-muted/30"
                  >
                    {group.group || "—"}
                  </th>
                ))}
                <th className="border-b border-border/50 p-1 w-10 min-w-[40px]"></th>
              </tr>
              {/* Column label row */}
              <tr>
                <th className="sticky left-0 z-20 bg-card border-r border-b border-border/50 p-1 min-w-[100px] w-[100px]">
                  <span className="text-xs text-muted-foreground">Kategori</span>
                </th>
                <th className="sticky left-[100px] z-20 bg-card border-r border-b border-border/50 p-1 min-w-[180px] w-[180px]">
                  <span className="text-xs text-muted-foreground">Rad</span>
                </th>
                {columns.map((col, colIndex) => (
                  <th key={colIndex} className="border-b border-r border-border/50 p-1 w-[60px] min-w-[60px] h-[180px] align-bottom overflow-hidden">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Redigera kolumn: ${col.label}`}
                          className="relative w-full h-full flex items-end justify-center text-xs font-medium hover:text-primary transition-colors group"
                        >
                          <span 
                            className="whitespace-nowrap [writing-mode:vertical-lr] rotate-180 max-h-[170px] overflow-hidden text-ellipsis"
                          >
                            {col.label}
                          </span>
                          <Pencil className="absolute top-1 right-0 h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="center">
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Gruppnamn</label>
                            <Input
                              value={col.group || ""}
                              onChange={(e) => handleColumnGroupChange(colIndex, e.target.value)}
                              className="h-8 text-sm"
                              placeholder="(ingen grupp)"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Kolumnnamn</label>
                            <Input
                              value={col.label}
                              onChange={(e) => handleColumnLabelChange(colIndex, e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                            />
                          </div>
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
                  {/* Category cell - only show for first row in category */}
                  {isFirstInCategory(rowIndex) && (
                    <td 
                      className="sticky left-0 z-10 bg-muted/20 border-r border-b border-border/50 p-1 min-w-[100px] w-[100px] align-top"
                      rowSpan={getCategoryRowCount(rowIndex)}
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="text-xs font-semibold text-left w-full hover:text-primary transition-colors group p-1"
                          >
                            {row.category || "—"}
                            <Pencil className="inline-block ml-1 h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" align="start">
                          <Input
                            value={row.category}
                            onChange={(e) => handleRowCategoryChange(rowIndex, e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Kategori..."
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </td>
                  )}
                  {/* Row label */}
                  <td className="sticky left-[100px] z-10 bg-card border-r border-b border-border/50 p-1 min-w-[180px] w-[180px]">
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
                <td className="sticky left-0 z-10 bg-card border-r border-border/50 p-1" colSpan={2}>
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
