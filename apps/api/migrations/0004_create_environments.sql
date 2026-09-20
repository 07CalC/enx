CREATE TABLE IF NOT EXISTS environments (
  id TEXT PRIMARY KEY,
  projectID TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create index if not exists idx_environments_projectID on environments(projectID);
