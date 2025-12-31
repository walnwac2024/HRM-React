-- Add post_type column to news table
ALTER TABLE news ADD COLUMN post_type ENUM('text', 'image') DEFAULT 'text' AFTER content;
