import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoredCategory {
  id: string;
  path: string;
  name: string;
  created_at: string;
  created_by: string;
}

export function useKlingerCategories() {
  return useQuery({
    queryKey: ["klinger-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('klinger_categories')
        .select('*')
        .order('path');

      if (error) throw error;
      return data as StoredCategory[];
    },
  });
}
