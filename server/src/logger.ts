import winston from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';
import { RequestContext } from './middleware/requestContext';
import { ReviewAttributes } from './models/Review';
import { Status, StatusText } from './types/status';

import packageJson from '../package.json';

// Configure logger with environment-based log level
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = winston.createLogger({
  level: logLevel,
  format: ecsFormat(),
  transports: [new winston.transports.Console()],
  defaultMeta: {
    'log.source.name': 'tillganglighetsverktyget',
    'log.source.platform': 'node',
    'log.source.version': packageJson.version,
    'log.source.type': 'application',
  },
});

interface ReviewUpdateChanges {
  title?: { old: string | null; new: string | null };
  excludedContentTypes?: { old: string | null; new: string | null };
  selectedPrefillIds?: { old: string | null; new: string | null };
  objectType?: { old: string | null; new: string | null };
  regulatoryFramework?: { old: string | null; new: string | null };
}

/**
 * Builds base audit log metadata from request context
 * This ensures consistency across all audit logs
 */
const buildAuditMetadata = (context: RequestContext) => {
  return {
    'user.name': context.userId || null,
    'source.ip': context.clientIp,
    'audit.log': 'true',
    'audit.spu': 'false',
  };
};

/**
 * Logs review creation audit event
 */
export const logReviewCreated = (
  review: ReviewAttributes,
  context: RequestContext,
) => {
  const userName = context.userId || 'okänd användare';
  const message = `Granskning '${review.title || 'Namnlös granskning'}' skapad av användare ${userName}`;

  logger.info(message, {
    ...buildAuditMetadata(context),
    'event.action': 'create',
    'object.type': 'review',
    'object.id': review.id,
  });
};

/**
 * Logs review update audit event
 * Only logs changed fields
 */
export const logReviewUpdated = (
  review: ReviewAttributes,
  changes: ReviewUpdateChanges,
  context: RequestContext,
) => {
  const userName = context.userId || 'okänd användare';
  const changeDescriptions: string[] = [];

  if (changes.title && changes.title.old !== changes.title.new) {
    const oldTitle = changes.title.old || 'tomt';
    const newTitle = changes.title.new || 'tomt';
    changeDescriptions.push(`Titel ändrad från '${oldTitle}' till '${newTitle}'`);
  }

  if (changes.excludedContentTypes && changes.excludedContentTypes.old !== changes.excludedContentTypes.new) {
    changeDescriptions.push('Exkluderade innehållstyper ändrade');
  }

  if (changes.selectedPrefillIds && changes.selectedPrefillIds.old !== changes.selectedPrefillIds.new) {
    changeDescriptions.push('Valda förifyllda krav ändrade');
  }

  if (changes.objectType && changes.objectType.old !== changes.objectType.new) {
    const oldType = changes.objectType.old || 'tomt';
    const newType = changes.objectType.new || 'tomt';
    changeDescriptions.push(`Objekttyp ändrad från '${oldType}' till '${newType}'`);
  }

  if (changes.regulatoryFramework && changes.regulatoryFramework.old !== changes.regulatoryFramework.new) {
    const oldFramework = changes.regulatoryFramework.old || 'tomt';
    const newFramework = changes.regulatoryFramework.new || 'tomt';
    changeDescriptions.push(`Regelverk ändrat från '${oldFramework}' till '${newFramework}'`);
  }

  if (changeDescriptions.length === 0) {
    // No actual changes detected, skip logging
    return;
  }

  const updateParameters = changeDescriptions.join(', ');
  const message = `Granskning '${review.title || 'Namnlös granskning'}' uppdaterad av användare ${userName}`;

  logger.info(message, {
    ...buildAuditMetadata(context),
    'event.action': 'update',
    'event.update_parameters': updateParameters,
    'object.type': 'review',
    'object.id': review.id,
  });
};

/**
 * Logs review deletion audit event
 */
export const logReviewDeleted = (
  review: ReviewAttributes,
  context: RequestContext,
) => {
  const userName = context.userId || 'okänd användare';
  const message = `Granskning '${review.title || 'Namnlös granskning'}' raderad av användare ${userName}`;

  logger.info(message, {
    ...buildAuditMetadata(context),
    'event.action': 'delete',
    'object.type': 'review',
    'object.id': review.id,
  });
};

/**
 * Logs check update audit event
 */
export const logCheckUpdated = (
  check: {
    review: number;
    requirement: string | null;
    status: number | null;
    comment: string | null;
    flag: number | null;
  },
  isNew: boolean,
  context: RequestContext,
) => {
  const userName = context.userId || 'okänd användare';
  
  // Get Swedish status text from StatusText enum
  let statusText: string;
  if (check.status === null) {
    statusText = StatusText.NOT_ASSESSED;
  } else {
    switch (check.status) {
      case Status.FAIL:
        statusText = StatusText.FAIL;
        break;
      case Status.PASS:
        statusText = StatusText.PASS;
        break;
      case Status.IRRELEVANT:
        statusText = StatusText.IRRELEVANT;
        break;
      case Status.NOT_ASSESSED:
        statusText = StatusText.NOT_ASSESSED;
        break;
      default:
        statusText = 'Okänd';
    }
  }
  
  const action = isNew ? 'skapad' : 'uppdaterad';
  const message = `Kontroll för krav ${check.requirement || 'okänt'} ${action} i granskning ${check.review} av användare ${userName}. Status: ${statusText}`;

  logger.info(message, {
    ...buildAuditMetadata(context),
    'event.action': isNew ? 'create' : 'update',
    'object.type': 'check',
    'object.id': `${check.review}-${check.requirement}`,
    'object.review_id': check.review,
    'object.requirement': check.requirement,
    'object.status': check.status,
    'object.flag': check.flag,
  });
};

export default logger;
