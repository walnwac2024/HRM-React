-- Drop and recreate news_reactions with correct foreign key
DROP TABLE IF EXISTS news_reactions;

CREATE TABLE news_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT NOT NULL,
    user_id INT NOT NULL,
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (news_id, user_id, emoji),
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES employee_records(id) ON DELETE CASCADE
);
