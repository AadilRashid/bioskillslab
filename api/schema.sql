CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  chapter    VARCHAR(50)   NOT NULL,
  name       VARCHAR(100)  NOT NULL DEFAULT 'Anonymous',
  email      VARCHAR(255)  DEFAULT NULL,
  text       TEXT          NOT NULL,
  token      VARCHAR(64)   NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chapter (chapter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  display_name  VARCHAR(100)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  DEFAULT NULL,
  recovery_phrase VARCHAR(255) DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS exam_attempts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  course     VARCHAR(50)   NOT NULL DEFAULT 'bioinfo',
  score      INT           NOT NULL,
  passed     TINYINT(1)    NOT NULL DEFAULT 0,
  taken_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS certificates (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  course      VARCHAR(50)   NOT NULL,
  cert_code   VARCHAR(32)   NOT NULL UNIQUE,
  score       INT           NOT NULL,
  issued_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
