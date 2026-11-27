import express from "express";
import cors from "cors";

import carRoutes from "./routes/carRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("Server Started");
});

app.use("/api/cars", carRoutes);

export default app;
