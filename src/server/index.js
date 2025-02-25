import express from "express";
import { createServer } from "node:http";
import routes from "./routes.js";

const app = express();
const port = process.env.SERVER_PORT || 3001;

app.use(express.json());
app.use("/api", routes);

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
