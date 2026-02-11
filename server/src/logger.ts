const pino = require('pino');
const { ecsFormat } = require('@elastic/ecs-pino-format');
// import { ecsFormat } from "@elastic/ecs-pino-format";
// import pino from "pino";

const logger = pino(ecsFormat());

export default logger;
