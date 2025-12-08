# KLINGER Sweden Produktassistent - Chat Interface

## Projektöversikt

En ultraclean chat-interface för KLINGER Sweden där säljare kan chatta med en bot om Klingers produkter. Designen är minimalistisk med mörkblå färger inspirerade av klinger.se.

### Funktioner
- Split-layout: Chat till vänster, dokumentbilder till höger (desktop)
- Mobil drawer (bottom sheet) för att visa dokumentbilder
- Klickbara meddelanden som visar relaterade PDF-sidor/bilder
- Thumbnails för flera bilder per svar
- Fullskärmsvisning av bilder
- Smooth animationer och transitions

### Teknisk stack
- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui komponenter

---

## Filstruktur

```
src/
├── components/
│   └── chat/
│       ├── ChatHeader.tsx
│       ├── ChatInput.tsx
│       ├── ChatMessage.tsx
│       ├── ImagePanel.tsx
│       └── KlingerChat.tsx
├── pages/
│   └── Index.tsx
├── index.css
└── ...
```

---

## Design System

### index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@layer base {
  :root {
    /* KLINGER Sweden Brand Colors - Deep Industrial Blue */
    --background: 210 25% 97%;
    --foreground: 205 75% 15%;

    --card: 0 0% 100%;
    --card-foreground: 205 75% 15%;

    --popover: 0 0% 100%;
    --popover-foreground: 205 75% 15%;

    /* Primary: KLINGER Deep Blue */
    --primary: 200 100% 24%;
    --primary-foreground: 0 0% 100%;

    /* Secondary: Light Blue Tint */
    --secondary: 200 30% 92%;
    --secondary-foreground: 200 100% 24%;

    --muted: 210 20% 94%;
    --muted-foreground: 205 20% 45%;

    /* Accent: Lighter KLINGER Blue */
    --accent: 200 80% 35%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 210 25% 88%;
    --input: 210 25% 88%;
    --ring: 200 100% 24%;

    --radius: 0.75rem;

    /* Chat specific tokens */
    --chat-user-bg: 200 100% 24%;
    --chat-user-fg: 0 0% 100%;
    --chat-bot-bg: 0 0% 100%;
    --chat-bot-fg: 205 75% 15%;
    --chat-panel-bg: 210 25% 98%;

    /* Image panel */
    --panel-bg: 205 50% 12%;
    --panel-fg: 0 0% 100%;
    --panel-muted: 205 30% 60%;

    /* Sidebar */
    --sidebar-background: 205 50% 12%;
    --sidebar-foreground: 0 0% 100%;
    --sidebar-primary: 200 100% 24%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 205 40% 20%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 205 40% 20%;
    --sidebar-ring: 200 80% 50%;
  }

  .dark {
    --background: 205 50% 8%;
    --foreground: 210 20% 95%;

    --card: 205 45% 12%;
    --card-foreground: 210 20% 95%;

    --popover: 205 45% 12%;
    --popover-foreground: 210 20% 95%;

    --primary: 200 85% 45%;
    --primary-foreground: 205 50% 8%;

    --secondary: 205 40% 18%;
    --secondary-foreground: 210 20% 95%;

    --muted: 205 40% 18%;
    --muted-foreground: 210 15% 60%;

    --accent: 200 70% 40%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 205 40% 20%;
    --input: 205 40% 20%;
    --ring: 200 85% 45%;

    --chat-user-bg: 200 85% 45%;
    --chat-user-fg: 205 50% 8%;
    --chat-bot-bg: 205 45% 15%;
    --chat-bot-fg: 210 20% 95%;
    --chat-panel-bg: 205 50% 10%;

    --panel-bg: 205 55% 6%;
    --panel-fg: 0 0% 100%;
    --panel-muted: 205 20% 50%;

    --sidebar-background: 205 55% 6%;
    --sidebar-foreground: 210 20% 95%;
    --sidebar-primary: 200 85% 45%;
    --sidebar-primary-foreground: 205 50% 8%;
    --sidebar-accent: 205 40% 15%;
    --sidebar-accent-foreground: 210 20% 95%;
    --sidebar-border: 205 40% 15%;
    --sidebar-ring: 200 85% 45%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
    border-radius: 3px;
  }
}
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chat: {
          user: {
            DEFAULT: "hsl(var(--chat-user-bg))",
            foreground: "hsl(var(--chat-user-fg))",
          },
          bot: {
            DEFAULT: "hsl(var(--chat-bot-bg))",
            foreground: "hsl(var(--chat-bot-fg))",
          },
          panel: "hsl(var(--chat-panel-bg))",
        },
        panel: {
          DEFAULT: "hsl(var(--panel-bg))",
          foreground: "hsl(var(--panel-fg))",
          muted: "hsl(var(--panel-muted))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## Komponenter

### src/pages/Index.tsx

```tsx
import { KlingerChat } from "@/components/chat/KlingerChat";

const Index = () => {
  return <KlingerChat />;
};

export default Index;
```

### src/components/chat/KlingerChat.tsx

```tsx
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ImagePanel } from "./ImagePanel";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: {
    id: string;
    url: string;
    title: string;
    page?: number;
  }[];
}

// Dummy data for demonstration
const dummyMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Vilka packningar rekommenderar ni för högtrycksapplikationer?",
  },
  {
    id: "2",
    role: "assistant",
    content: "För högtrycksapplikationer rekommenderar vi KLINGER® Quantum, som är optimerad för tryck upp till 250 bar. Den har utmärkt kemisk resistens och lång livslängd. Se dokumentationen för fullständiga specifikationer.",
    images: [
      {
        id: "img1",
        url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=1000&fit=crop",
        title: "KLINGER Quantum - Teknisk specifikation",
        page: 1,
      },
    ],
  },
  {
    id: "3",
    role: "user",
    content: "Finns det alternativ för kemiskt aggressiva miljöer?",
  },
  {
    id: "4",
    role: "assistant",
    content: "Absolut! För kemiskt aggressiva miljöer har vi flera alternativ beroende på specifik kemikalie och temperatur. KLINGER® SIL C-4430 är populär för syror, medan KLINGER® Graphit PSM passar för alkaliska miljöer. Jag bifogar produktblad för båda.",
    images: [
      {
        id: "img2",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=1000&fit=crop",
        title: "KLINGER SIL C-4430 - Produktblad",
        page: 12,
      },
      {
        id: "img3",
        url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1000&fit=crop",
        title: "KLINGER Graphit PSM - Kemisk resistens",
        page: 8,
      },
      {
        id: "img4",
        url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=1000&fit=crop",
        title: "Jämförelsetabell kemikalieresistens",
        page: 15,
      },
    ],
  },
  {
    id: "5",
    role: "user",
    content: "Tack! Vad är leveranstiden för SIL C-4430?",
  },
  {
    id: "6",
    role: "assistant",
    content: "KLINGER SIL C-4430 finns normalt i lager med leveranstid 2-3 arbetsdagar inom Sverige. För större kvantiteter eller specialdimensioner kan leveranstiden vara 1-2 veckor. Kontakta gärna vår kundtjänst för exakt leveransbesked på din specifika order.",
  },
];

export function KlingerChat() {
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>("4");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);
  const selectedImages = selectedMessage?.images || [];

  const handleMessageClick = (message: Message) => {
    if (message.images?.length) {
      setSelectedMessageId(message.id);
      // Open drawer on mobile
      setMobileDrawerOpen(true);
    }
  };

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Tack för din fråga! Jag analyserar produktkatalogen och återkommer med relevant information.",
      };
      setMessages((prev) => [...prev, newBotMessage]);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex bg-background">
      {/* Left: Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-chat-panel">
          <div className="max-w-3xl mx-auto py-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "animate-fade-in",
                  index > 0 && "mt-1"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  isSelected={message.id === selectedMessageId}
                  onClick={() => handleMessageClick(message)}
                  hasImages={!!message.images?.length}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSend={handleSendMessage} />
      </main>

      {/* Right: Image Panel - Desktop */}
      <aside className="w-[380px] flex-shrink-0 bg-panel border-l border-sidebar-border hidden lg:flex flex-col">
        <ImagePanel images={selectedImages} selectedMessageId={selectedMessageId || undefined} />
      </aside>

      {/* Mobile: Image Drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-panel border-t border-sidebar-border p-0 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Dokumentation</SheetTitle>
          </SheetHeader>
          <ImagePanel images={selectedImages} selectedMessageId={selectedMessageId || undefined} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### src/components/chat/ChatHeader.tsx

```tsx
import { Bot, MoreVertical } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">KLINGER Produktassistent</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>
      
      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
        <MoreVertical className="w-5 h-5 text-muted-foreground" />
      </button>
    </header>
  );
}
```

### src/components/chat/ChatInput.tsx

```tsx
import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ställ en fråga om Klingers produkter..."
          disabled={disabled}
          className={cn(
            "flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            "p-3 rounded-xl bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary",
            "shadow-sm hover:shadow-md"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
```

### src/components/chat/ChatMessage.tsx

```tsx
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isSelected?: boolean;
  onClick?: () => void;
  hasImages?: boolean;
}

export function ChatMessage({ role, content, isSelected, onClick, hasImages }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group flex gap-3 p-4 transition-all duration-200 cursor-pointer rounded-xl",
        isUser ? "flex-row-reverse" : "flex-row",
        isSelected && !isUser && "bg-secondary/50 ring-1 ring-primary/20",
        !isSelected && "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          isUser && "text-right"
        )}
      >
        <div
          className={cn(
            "inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser 
              ? "bg-chat-user text-chat-user-foreground rounded-br-md" 
              : "bg-chat-bot text-chat-bot-foreground shadow-sm border border-border/50 rounded-bl-md"
          )}
        >
          {content}
        </div>
        
        {/* Image indicator */}
        {hasImages && !isUser && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
            <span>Dokumentation tillgänglig</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### src/components/chat/ImagePanel.tsx

```tsx
import { cn } from "@/lib/utils";
import { FileText, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ImageData {
  id: string;
  url: string;
  title: string;
  page?: number;
}

interface ImagePanelProps {
  images: ImageData[];
  selectedMessageId?: string;
}

export function ImagePanel({ images, selectedMessageId }: ImagePanelProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-panel-muted p-8">
        <div className="w-16 h-16 rounded-2xl bg-panel-muted/10 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-center">
          Välj ett meddelande för att visa
          <br />
          tillhörande dokumentation
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="text-sm font-semibold text-panel-foreground">
          Relaterad dokumentation
        </h3>
        <p className="text-xs text-panel-muted mt-1">
          {images.length} {images.length === 1 ? "dokument" : "dokument"} • Klicka för att förstora
        </p>
      </div>

      {/* Main Image */}
      <div className="flex-1 p-4 overflow-hidden">
        <div 
          className="relative h-full bg-panel-foreground/5 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setExpandedImage(images[currentIndex].id)}
        >
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].title}
            className="w-full h-full object-contain p-2"
          />
          
          {/* Zoom overlay */}
          <div className="absolute inset-0 bg-panel/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-panel-foreground/10 backdrop-blur-sm p-3 rounded-full">
              <ZoomIn className="w-6 h-6 text-panel-foreground" />
            </div>
          </div>

          {/* Page indicator */}
          {images[currentIndex].page && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-panel/80 backdrop-blur-sm rounded-md text-xs text-panel-foreground font-medium">
              Sida {images[currentIndex].page}
            </div>
          )}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-panel/80 backdrop-blur-sm text-panel-foreground hover:bg-panel transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-panel/80 backdrop-blur-sm text-panel-foreground hover:bg-panel transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 pt-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-sidebar-border/50 hover:border-panel-muted"
                )}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document title */}
      <div className="p-4 pt-0">
        <div className="bg-sidebar-accent/50 rounded-lg p-3">
          <p className="text-xs text-panel-muted">Dokument</p>
          <p className="text-sm font-medium text-panel-foreground mt-0.5 truncate">
            {images[currentIndex].title}
          </p>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-panel/95 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setExpandedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-panel-foreground/10 text-panel-foreground hover:bg-panel-foreground/20 transition-colors"
            onClick={() => setExpandedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={images.find(img => img.id === expandedImage)?.url}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
```

---

## index.html

```html
<!doctype html>
<html lang="sv">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KLINGER Sweden - Produktassistent</title>
    <meta name="description" content="KLINGER Sweden säljassistent för produktinformation och dokumentation" />
    <meta name="author" content="KLINGER Sweden" />

    <meta property="og:title" content="KLINGER Sweden - Produktassistent" />
    <meta property="og:description" content="KLINGER Sweden säljassistent för produktinformation och dokumentation" />
    <meta property="og:type" content="website" />

    <meta name="twitter:card" content="summary_large_image" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Beroenden (package.json)

Viktiga paket som används:
- `react` & `react-dom`: ^18.3.1
- `react-router-dom`: ^6.30.1
- `tailwindcss-animate`: ^1.0.7
- `lucide-react`: ^0.462.0
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `tailwind-merge`: ^2.6.0

---

## Designprinciper

1. **Färgpalett**: KLINGER mörkblå (#00507a / HSL 200 100% 24%) som primärfärg
2. **Typography**: Inter font family för clean, modern look
3. **Layout**: Split-view med chat till vänster och dokumentpanel till höger (desktop)
4. **Interaktioner**: Subtila hover-effekter, smooth transitions (200-300ms)
5. **Bildhantering**: Thumbnails, navigation mellan bilder, fullskärmsvisning
6. **Responsivitet**: 
   - Desktop (≥ lg): Fast bildpanel till höger
   - Mobil (< lg): Bottom sheet/drawer för dokumentbilder, öppnas vid klick på meddelande med bilder
