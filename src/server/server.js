import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import dotenv from "dotenv";

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
