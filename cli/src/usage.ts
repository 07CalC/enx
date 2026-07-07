export function projectUsage() {
  console.log(`
Usage:
  enx project create                      Create a new project
  enx project list                        List all projects
  enx project update                      Update a project's name
  enx project delete                      Delete a project
`);
}

export function envUsage() {
  console.log(`
Usage:
  enx <project> env create                Create an environment
  enx <project> env list                  List environments
  enx <project> <env> update              Update an environment's name
  enx <project> <env> delete              Delete an environment
`);
}

export function variableUsage() {
  console.log(`
Usage:
  enx <project> <env> var create          Create a variable
  enx <project> <env> var create --file   Create variables from a .env file
  enx <project> <env> var list            List all variables
  enx <project> <env> var inject          Print export statements for eval
  enx <project> <env> var fetch           Print variables in .env format
  enx <project> <env> var fetch --file    Write variables to a file
`);
}

export function apiKeyUsage() {
  console.log(`
Usage:
  enx api-key create                      Create an API key
  enx api-key list                        List API keys
  enx api-key delete                      Delete an API key
`);
}

export function authUsage() {
  console.log(`
Usage:
  enx login                               Log in with email and password
  enx signup                              Sign up with name, email and password
`);
}

export function configUsage() {
  console.log(`
Usage:
  enx config set url <url>                Set the API URL
`);
}

export function usage() {
  console.log(`
Enx - Environment Variables Manager

Usage:
  enx <command> [options]

Commands:
  login, signup           Authentication
  project                 Manage projects
  api-key                 Manage API keys
  config                  Configuration

  <project> env           Manage environments
  <project> <env> var     Manage variables
`);
}
