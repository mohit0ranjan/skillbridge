-- Screening Funnel table (isolated add-on)
CREATE TABLE IF NOT EXISTS screening_leads (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  year TEXT NOT NULL,
  branch TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'screened', 'converted')),
  test_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS screening_leads_email_lower_unique
ON screening_leads (LOWER(email));
