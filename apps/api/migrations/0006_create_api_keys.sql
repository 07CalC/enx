CREATE TABLE IF NOT EXISTS apiKeys (
  projectID TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- will be an array of strings, containing "read", "write", "delete"
  -- these permissions are only used for the env variables, not for the project itself
  permissions TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  keyHash TEXT NOT NULL PRIMARY KEY,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_apiKeys_projectID ON apiKeys(projectID);
