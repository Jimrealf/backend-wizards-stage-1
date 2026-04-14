import app from "./app";
import { initSchema } from "./utils/db";

const PORT = process.env.PORT ?? 3000;

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database schema:", err);
    process.exit(1);
  });
