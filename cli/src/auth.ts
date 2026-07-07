import { input, password } from "@inquirer/prompts";
import { usage } from "./usage.ts";
import { apiFetch } from "./api.ts";
import { printTable } from "./format.ts";
import { setConfig } from "./config.ts";

export const handleAuth = async (args: string[]) => {
  if (args.length === 0) {
    usage();
    process.exit(1);
  }
  if (args[0] === "login") {
    const emailInput = await input({ message: "Enter your email:", required: true });
    const passwordInput = await password({ message: "Enter your password:" });
    try {
      const res = await apiFetch<
        {
          user: {
            id: string;
            name: string;
            email: string;
          };
          token: string;
        }
      >("/auth/email", {
        method: "POST",
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
        }),
      })
      const token = res.data.token;
      setConfig({
        token
      })
      printTable(
        [{ header: "ID" }, { header: "Name" }, { header: "Email" }],
        [{ id: res.data.user.id, name: res.data.user.name, email: res.data.user.email }],
      );
      console.log("Successfully logged in.");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("An unknown error occurred.");
      }
    }
  } else if (args[0] === "signup") {
    const nameInput = await input({ message: "Enter your name:", required: true });
    const emailInput = await input({ message: "Enter your email:", required: true });
    const passwordInput = await password({ message: "Enter your password:" });
    try {
      const res = await apiFetch<
        {
          user: {
            id: string;
            name: string;
            email: string;
          };
          token: string;
        }
      >("/auth/email", {
        method: "POST",
        body: JSON.stringify({
          email: emailInput,
          name: nameInput,
          password: passwordInput,
        }),
      })
      const token = res.data.token;
      setConfig({
        token
      })
      printTable(
        [{ header: "ID" }, { header: "Name" }, { header: "Email" }],
        [{ id: res.data.user.id, name: res.data.user.name, email: res.data.user.email }],
      );
      console.log("Successfully signed up.");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("An unknown error occurred.");
      }
    }
  } else if (args[0] === "logout") {
    setConfig({
      token: ""
    })
    console.log("Successfully logged out.");
  }

  else {
    usage();
    process.exit(1);
  }
}
