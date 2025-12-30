import { Request, Response } from "express";
import { Granskning } from "../types/granskning";

export const getGranskningar = async (req: Request, res: Response) => {
  const granskningar = await Granskning.findAll();
  res.json(granskningar);
};
