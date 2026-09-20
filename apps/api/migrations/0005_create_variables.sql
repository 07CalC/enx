CREATE TABLE IF NOT EXISTS variables (
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  environmentID TEXT NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  PRIMARY KEY (key, environmentID)
);

CREATE INDEX IF NOT EXISTS idx_variables_environmentID ON variables(environmentID);
