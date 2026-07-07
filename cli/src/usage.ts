export function authUsage() {
  console.log(`
Authentication:
  enx signup
      Sign up with name, email and password.

  enx login
      Log in and save the authentication token locally.
`);
}

export function projectUsage() {
  console.log(`
Projects:
  enx project create
      Create a new project.

  enx project list
      List all projects.

  enx project update
      Update a project's name.

  enx project delete
      Delete a project.
`);
}

export function envUsage() {
  console.log(`
Environments:
  enx <project> env create
      Create a new environment.

  enx <project> env list
      List all environments in a project.

  enx <project> <environment> update
      Update an environment's name.

  enx <project> <environment> delete
      Delete an environment.
`);
}

export function variableUsage() {
  console.log(`
Variables:
  enx <project> <environment> var create
      Create a new variable.

  enx <project> <environment> var create --file <path>
      Create variables from a file.

  enx <project> <environment> var list
      List all variables.

  enx <project> <environment> var inject
      Inject variables into the current shell session.

  enx <project> <environment> var fetch
      Print variables in .env format.

  enx <project> <environment> var fetch --file <path>
      Write variables to a file.
`);
}

export function apiKeyUsage() {
  console.log(`
API Keys:
  enx api-key create
      Create a new API key.

  enx api-key list
      List all API keys.

  enx api-key delete
      Delete an API key.
`);
}

export function configUsage() {
  console.log(`
Configuration:
  enx config set url <url>
      Set the API URL.

Defaults:
  API URL: http://localhost:8787
`);
}

export function usage() {
  console.log(`
Enx - Environment Variables Manager

Usage:
  enx <command> [options]
`);

  authUsage();
  projectUsage();
  envUsage();
  variableUsage();
  apiKeyUsage();
  configUsage();

  console.log(`
Run "enx <command> --help" for more information on a command.
`);
}
