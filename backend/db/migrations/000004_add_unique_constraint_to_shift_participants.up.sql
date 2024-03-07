-- Down Migration for shift_volunteers table
ALTER TABLE shift_volunteers DROP INDEX shift_volunteers_unique;

-- Down Migration for shift_leaders table
ALTER TABLE shift_leaders DROP INDEX shift_leaders_unique;
