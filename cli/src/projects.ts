import { apiFetch } from "./api.ts";
import { projectUsage } from "./usage.ts";
import { printTable } from "./format.ts";
import { input, confirm } from "@inquirer/prompts"

export const handleProjects = async (args: string[]) => {
  if (args.length === 0) {
    projectUsage();
    process.exit(1);
  }
  if (args[0] === "create") {
    const name = await input({ message: "Enter project name:", required: true })
    try {
      const res = await apiFetch<{
        project: {
          id: string;
          name: string;
          createdAt: string;
        }
      }>("/projects", {
        method: "POST",
        body: JSON.stringify({ name }),
      })
      if (!res.error) {
        printTable(
          [{ header: "ID" }, { header: "Name" }, { header: "Created" }],
          [{ id: res.data.project.id, name: res.data.project.name, createdAt: res.data.project.createdAt }],
        )
      } else {
        console.error(`Error creating project: ${res.error.message}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error creating project: ${error.message}`)
      } else {
        console.error("Unknown error creating project")
      }
    }
  }
  else if (args[0] === "list") {
    try {
      const res = await apiFetch<{
        projects: {
          id: string;
          name: string;
          createdAt: string;
        }[]
      }>("/projects", {
        method: "GET",
      })
      if (!res.error) {
        printTable(
          [{ header: "ID" }, { header: "Name" }, { header: "Created" }],
          res.data.projects.map((p) => ({ id: p.id, name: p.name, createdAt: p.createdAt })),
        )
      } else {
        console.error(`Error listing projects: ${res.error.message}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error listing projects: ${error.message}`)
      } else {
        console.error("Unknown error listing projects")
      }
    }
  }
  else if (args[0] === "update") {
    const projectName = await input({ message: "Enter current project name:", required: true })
    const newName = await input({ message: "Enter new project name:", required: true })
    try {
      const res = await apiFetch<{
        project: {
          id: string;
          name: string;
          createdAt: string;
        }
      }>(`/projects/${projectName}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      })
      if (!res.error) {
        printTable(
          [{ header: "ID" }, { header: "Name" }, { header: "Created" }],
          [{ id: res.data.project.id, name: res.data.project.name, createdAt: res.data.project.createdAt }],
        )
      } else {
        console.error(`Error updating project: ${res.error.message}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating project: ${error.message}`)
      } else {
        console.error("Unknown error updating project")
      }
    }
  }
  else if (args[0] === "delete") {
    const name = await input({ message: "Enter project name to delete:", required: true })
    const answer = await confirm({ message: `Are you sure you want to delete project "${name}"?` })
    if (!answer) {
      console.log("Deletion cancelled.")
      return
    }
    try {
      const res = await apiFetch<{
        project: {
          id: string;
          name: string;
          createdAt: string;
        }
      }>(`/projects/${name}`, {
        method: "DELETE",
      })
      if (!res.error) {
        console.log(`Project deleted: ${res.data.project.name}`)
      } else {
        console.error(`Error deleting project: ${res.error.message}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error deleting project: ${error.message}`)
      } else {
        console.error("Unknown error deleting project")
      }
    }
  } else {
    projectUsage()
  }
}
