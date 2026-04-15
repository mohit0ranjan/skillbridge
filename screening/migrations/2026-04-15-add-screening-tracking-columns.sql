-- Screening Funnel tracking enhancements
ALTER TABLE screening_leads
ADD COLUMN IF NOT EXISTS test_score INT,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS clicked_confirm BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT false;
