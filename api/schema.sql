CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  chapter    VARCHAR(50)   NOT NULL,
  name       VARCHAR(100)  NOT NULL DEFAULT 'Anonymous',
  email      VARCHAR(255)  DEFAULT NULL,
  text       TEXT          NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chapter (chapter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
