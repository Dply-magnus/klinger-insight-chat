import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Ogiltig e-postadress"),
  password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
});

const signupSchema = z.object({
  email: z.string().trim().email("Ogiltig e-postadress"),
  password: z.string().min(6, "Lösenord måste vara minst 6 tecken"),
  fullName: z.string().trim().min(2, "Namn måste vara minst 2 tecken").max(100),
  company: z.string().trim().max(100).optional(),
});

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/documents");
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    setErrors({});
    
    try {
      if (isSignup) {
        signupSchema.parse({ email, password, fullName, company: company || undefined });
      } else {
        loginSchema.parse({ email, password });
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      let message = "Ett fel uppstod vid inloggning";
      if (error.message.includes("Invalid login credentials")) {
        message = "Felaktig e-post eller lösenord";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Bekräfta din e-post först";
      }
      toast({ title: "Inloggning misslyckades", description: message, variant: "destructive" });
    } else {
      toast({ title: "Välkommen tillbaka!" });
      navigate("/documents");
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/documents`;
    
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
          company: company.trim() || null,
        },
      },
    });

    if (error) {
      let message = "Ett fel uppstod vid registrering";
      if (error.message.includes("already registered")) {
        message = "E-postadressen är redan registrerad";
      }
      toast({ title: "Registrering misslyckades", description: message, variant: "destructive" });
    } else {
      toast({
        title: "Konto skapat!",
        description: "Kontrollera din e-post för att bekräfta kontot, eller logga in direkt om e-postbekräftelse är inaktiverad.",
      });
      setIsSignup(false);
    }
    
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar-background p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sidebar-foreground">
            KLINGER
          </h1>
          <p className="text-sidebar-accent-foreground/70 mt-2">
            Dokumenthantering
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-sidebar-accent/30 rounded-xl border border-sidebar-border">
            <h3 className="text-xl font-semibold text-sidebar-foreground mb-2">
              Hantera dokument enkelt
            </h3>
            <p className="text-sidebar-foreground/70">
              Ladda upp, organisera och versionshantera dina PDF-dokument för chatboten.
            </p>
          </div>
          <div className="p-6 bg-sidebar-accent/30 rounded-xl border border-sidebar-border">
            <h3 className="text-xl font-semibold text-sidebar-foreground mb-2">
              Säker lagring
            </h3>
            <p className="text-sidebar-foreground/70">
              Alla dokument lagras säkert i molnet med fullständig versionshistorik.
            </p>
          </div>
        </div>
        
        <p className="text-sidebar-foreground/50 text-sm">
          © {new Date().getFullYear()} KLINGER Sweden
        </p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isSignup ? "Skapa konto" : "Logga in"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {isSignup
                  ? "Fyll i dina uppgifter för att skapa ett konto"
                  : "Välkommen tillbaka! Logga in för att fortsätta"}
              </p>
            </div>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Namn</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ditt namn"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Företag (valfritt)</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Företagsnamn"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="din@epost.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSignup ? "Skapa konto" : "Logga in"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setErrors({});
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignup
                ? "Har du redan ett konto? Logga in"
                : "Inget konto? Skapa ett"}
            </button>
          </div>

          {!isSignup && (
            <p className="text-xs text-center text-muted-foreground">
              Tips: Om du testar lokalt, inaktivera "Confirm email" i Supabase Dashboard under Authentication → Providers → Email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
