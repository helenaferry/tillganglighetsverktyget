import { Router } from "express";
import { getGranskningar } from "../controllers/granskningController";

const router = Router();

router.get("/", getGranskningar);

export default router;
