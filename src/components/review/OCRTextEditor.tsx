import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OCRTextEditorProps {
  content: string | null;
  pageId: string;
  onSave: (data: { id: string; content: string }) => void;
  isSaving: boolean;
}

interface TextSection {
  id: string;
  content: string;
  preview: string;
}

export function OCRTextEditor({ content, pageId, onSave, isSaving }: OCRTextEditorProps) {
  const [sections, setSections] = useState<TextSection[]>([]);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Parse content into sections (split by double newlines = paragraphs)
  useEffect(() => {
    const text = content || "";
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    const newSections = paragraphs.map((p, index) => ({
      id: `section-${index}`,
      content: p.trim(),
      preview: p.trim().substring(0, 60) + (p.trim().length > 60 ? "..." : ""),
    }));
    
    setSections(newSections);
    setOpenSections([]);
    setHasChanges(false);
  }, [content, pageId]);

  const handleSectionChange = (sectionId: string, newContent: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, content: newContent, preview: newContent.substring(0, 60) + (newContent.length > 60 ? "..." : "") }
        : s
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    const fullContent = sections.map(s => s.content).join("\n\n");
    onSave({ id: pageId, content: fullContent });
    setHasChanges(false);
  };

  const handleExpandAll = () => {
    setOpenSections(sections.map(s => s.id));
  };

  const handleCollapseAll = () => {
    setOpenSections([]);
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b border-border/50 bg-card/50">
          <span className="text-sm font-medium text-foreground">OCR-text</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Ingen OCR-text tillgänglig</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border/50 bg-card/50 gap-2">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          OCR-text ({sections.length} stycken)
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpandAll}
            className="gap-1 text-xs h-7"
          >
            <ChevronDown className="h-3 w-3" />
            Alla
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapseAll}
            className="gap-1 text-xs h-7"
          >
            <ChevronUp className="h-3 w-3" />
            Stäng
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Spara
          </Button>
        </div>
      </div>

      {/* Accordion sections */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-2"
          >
            {sections.map((section, index) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border border-border/50 rounded-lg bg-card/30 overflow-hidden"
              >
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/30 text-left">
                  <span className="text-sm font-mono text-muted-foreground truncate pr-2">
                    <span className="text-primary font-medium mr-2">§{index + 1}</span>
                    {section.preview}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <Textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(section.id, e.target.value)}
                    className="min-h-[120px] resize-none font-mono text-sm bg-background/50 border-border/50"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>

      {/* Status indicator */}
      {hasChanges && (
        <div className="px-4 py-2 border-t border-border/50">
          <p className="text-xs text-amber-500">Osparade ändringar</p>
        </div>
      )}
    </div>
  );
}
