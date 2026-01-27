-- Add ICE column to clients table
ALTER TABLE clients 
ADD COLUMN ice VARCHAR(20) AFTER email;

-- Add index for ICE field
CREATE INDEX idx_ice ON clients(ice);
