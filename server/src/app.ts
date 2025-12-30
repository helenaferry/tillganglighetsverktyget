import express from "express";
import granskningRoutes from "./routes/granskningRoutes";

const app = express();

app.use(express.json());
app.use("/granskningar", granskningRoutes);

export default app;
