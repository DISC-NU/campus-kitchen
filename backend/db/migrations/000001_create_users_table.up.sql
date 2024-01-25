CREATE TABLE IF NOT EXISTS Person (
    volunteer_name VARCHAR(255) NOT NULL,
    volunteer_type ENUM('volunteer', 'shift_lead') NOT NULL,
    total_hours_volunteered FLOAT NOT NULL,
    total_pounds_food_recovered FLOAT NOT NULL,
    total_number_meals_given FLOAT NOT NULL,
    PRIMARY KEY (volunteer_name)
);