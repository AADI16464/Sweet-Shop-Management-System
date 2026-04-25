import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from "./app";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

async function main() {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
