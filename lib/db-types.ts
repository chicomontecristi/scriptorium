// ─── TINTAXIS — DATABASE TYPES ────────────────────────────────────────────────
// Auto-generated via `npx supabase gen types typescript` in future.
// For now, hand-authored to match the readers table schema.

export type ReaderTier = "codex" | "scribe" | "archive" | "chronicler";
export type AuthorPlan = "manuscript" | "press";

export interface ReaderRow {
  id:                      string;
  email:                   string;
  name:                    string | null;
  stripe_customer_id:      string | null;
  stripe_subscription_id:  string | null;
  tier:                    ReaderTier | null;
  plan:                    AuthorPlan | null;
  role:                    "reader" | "author";
  active:                  boolean;
  created_at:              string;
  updated_at:              string;
}

export interface PurchaseRow {
  id:                string;
  reader_id:         string;
  chapter_slug:      string;
  plan:              string;       // 'read' | 'keep'
  stripe_session_id: string;
  amount:            number | null;
  writer_slug:       string | null;
  created_at:        string;
}

export interface SignalRow {
  id:            string;
  chapter_slug:  string;
  chapter_title: string | null;
  selected_text: string | null;
  question:      string;
  reader_email:  string | null;
  answered:      boolean;
  reply:         string | null;
  created_at:    string;
  updated_at:    string;
}

// Supabase Database type expected by createClient<Database>
export interface Database {
  public: {
    Tables: {
      readers: {
        Row:    ReaderRow;
        Insert: Omit<ReaderRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ReaderRow, "id" | "created_at">>;
      };
      purchases: {
        Row:    PurchaseRow;
        Insert: Omit<PurchaseRow, "id" | "created_at">;
        Update: Partial<Omit<PurchaseRow, "id" | "created_at">>;
      };
      signals: {
        Row:    SignalRow;
        Insert: Omit<SignalRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<SignalRow, "id" | "created_at">>;
      };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
}
