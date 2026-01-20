-- Create weekends table
CREATE TABLE weekends (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  notes TEXT,
  total_time_seconds INT DEFAULT 0,
  timer_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subtasks table
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekend_id INT REFERENCES weekends(id) ON DELETE CASCADE,
  text VARCHAR(500) NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE weekends ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies for single-user app
CREATE POLICY "Allow public read on weekends" ON weekends FOR SELECT USING (true);
CREATE POLICY "Allow public insert on weekends" ON weekends FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on weekends" ON weekends FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on weekends" ON weekends FOR DELETE USING (true);

CREATE POLICY "Allow public read on subtasks" ON subtasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on subtasks" ON subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on subtasks" ON subtasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on subtasks" ON subtasks FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to weekends table
CREATE TRIGGER update_weekends_updated_at
  BEFORE UPDATE ON weekends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default weekend data
INSERT INTO weekends (id, title, description) VALUES
  (1, 'Weekend 1', 'Build Your Resolution Tracker'),
  (2, 'Weekend 2', ''),
  (3, 'Weekend 3', ''),
  (4, 'Weekend 4', ''),
  (5, 'Weekend 5', ''),
  (6, 'Weekend 6', ''),
  (7, 'Weekend 7', ''),
  (8, 'Weekend 8', ''),
  (9, 'Weekend 9', ''),
  (10, 'Weekend 10', '');

-- Create index for subtasks lookup
CREATE INDEX idx_subtasks_weekend_id ON subtasks(weekend_id);