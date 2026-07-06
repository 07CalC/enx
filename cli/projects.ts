import { projectUsage } from "./usage.ts";
import { input } from "@inquirer/prompts"



export const handleProjects = async (args: string[]) => {
  if (args.length === 0) {
    projectUsage();
    process.exit(1);
  }
  if (args[0] === "create") {
    const name = await input({ message: "Enter project name:", required: true })
    console.log(`Creating project: ${name}`)
  }
  if (args[0] === "list") {
    console.log("Listing projects...")
  }
  if (args[0] === "update") {
    const name = await input({ message: "Enter project name:", required: true })
    console.log(`Updating project: ${name}`)
  }
  if (args[0] === "delete") {
    const name = await input({ message: "Enter project name:", required: true })
    console.log(`Deleting project: ${name}`)
  }
}
