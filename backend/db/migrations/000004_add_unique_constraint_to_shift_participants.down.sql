-- Adds a unique constraint on user_id and shift_id in shift_volunteers table
ALTER TABLE shift_volunteers
ADD CONSTRAINT shift_volunteers_unique UNIQUE (user_id, shift_id);

-- Adds a unique constraint on user_id and shift_id in shift_leaders table
ALTER TABLE shift_leaders
ADD CONSTRAINT shift_leaders_unique UNIQUE (user_id, shift_id);
