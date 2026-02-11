import winston from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';
import { CheckAttributes } from './models/Check';

const logger = winston.createLogger({
  format: ecsFormat(),
  transports: [new winston.transports.Console()],
});

interface ReviewLogAttributes {
  id: number;
  title: string | null;
}

interface CheckLogAttributes {
  reviewId: number;
  requirement: string | null;
  status: number | null;
  comment: string | null;
  flag: number | null;
}
export const logCreatedReview = (review: ReviewLogAttributes) => {
  logger.info('Logging: Created new review', {
    reviewId: review.id,
    reviewTitle: review.title,
  });
};
export const logUpdatedReview = (review: ReviewLogAttributes) => {
  logger.info('Logging: Updated review', {
    reviewId: review.id,
    reviewTitle: review.title,
  });
};
export const logCheckUpserted = (logAttributes: CheckLogAttributes) => {
  logger.info('Logging: Upserted check', {
    reviewId: logAttributes.reviewId,
    requirement: logAttributes.requirement,
    status: logAttributes.status,
    comment: logAttributes.comment,
    flag: logAttributes.flag,
  });
};
export const logDeletedReview = (review: ReviewLogAttributes) => {
  logger.info('Logging: Deleted review', {
    reviewId: review.id,
    reviewTitle: review.title,
  });
};

export default logger;
