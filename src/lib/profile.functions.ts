import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Profile = {
  full_name: string | null;
  study_description: string | null;
  exam: string | null;
};

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Profile> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("full_name, study_description, exam")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (
      data ?? { full_name: null, study_description: null, exam: null }
    );
  });

const UpdateSchema = z.object({
  full_name: z.string().trim().max(120).optional().nullable(),
  study_description: z.string().trim().max(1000).optional().nullable(),
  exam: z.string().trim().max(120).optional().nullable(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateSchema.parse(input))
  .handler(async ({ data, context }): Promise<Profile> => {
    const { data: updated, error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data }, { onConflict: "id" })
      .select("full_name, study_description, exam")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });
