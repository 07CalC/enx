CREATE TABLE IF NOT EXISTS projectMembers (
  projectID TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  userID TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- will be an array of strings, containing "read", "write", "delete"
  -- these permissions are only used for the env variables, not for the project itself
  permissions TEXT NOT NULL,
  isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (projectID, userID)
);

create index if not exists idx_projectMembers_projectID on projectMembers(projectID);
create index if not exists idx_projectMembers_userID on projectMembers(userID);
