import express from "express";
import { createServer } from "http";
import routes from "./server/routes.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use("/api", routes);

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
