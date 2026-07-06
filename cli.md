# Cli usage

## auth commands

`enx login` - login using email and password (no google for now), saves the token in the config file.
`enx signup` - signup using email and password and asks for name first (not optional)

## project commands

`enx project create` - creates a new project, asks for name
`enx project list` - lists all projects
`enx project delete` - deletes a project, asks for confirmation
`enx project update` - updates a project, asks for name

## environment commands

`env {project_name} env create` - creates a new environment, asks for name
`env {project_name} env list` - lists all environments for a project
`env {project_name} {env_name} delete` - deletes an environment, asks for confirmation
`env {project_name} {env_name} update` - updates an environment, asks for name

## variable commands

`env {project_name} {env_name} var create` - creates a new variable, asks for key and value
`env {project_name} {env_name} var list` - lists all variables for an environment
`env {project_name} {env_name} var create --file {file_path}` - reads that file, validates it, and creates new variables with the file content as value
`env {project_name} {env_name} var inject` - injects the variables into the current shell session, so you can use them in your scripts or commands
`env {project_name} {env_name} var fetch --file {file_path}` - fetches the variables and writes them to a file, so you can use them in your scripts or commands, if no file path is provided, it will print the variables .env

## config

- by default the api url will be set to 'http://localhost:8787', you can change it by the command
`enx config set url {url}` - sets the api url and saves it in the config file

