import { projectUsage, usage } from "./usage.ts";
import { input } from "@inquirer/prompts"


export const handleProjects = async (args: string[]) => {
  if (args.length === 0) {
    usage();
    process.exit(1);
  }
  if (args[0] === "project") {
    if (args[1] === "create") {
      const name = await input({ message: "Enter project name:", required: true })
    }
    else if (args[1] === "list") {
      console.log("Listing projects...")
    }
    else if (args[1] === "update") {
      const name = await input({ message: "Enter project name:", required: true })
      console.log(`Updating project: ${name}`)
    }
    else if (args[2] === "delete") {
      const name = await input({ message: "Enter project name:", required: true })
      console.log(`Deleting project: ${name}`)
    } else {
      projectUsage()
    }
  } else {
    const projectName = args[0]
  }
}
