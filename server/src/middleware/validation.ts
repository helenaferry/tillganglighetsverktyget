import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

// Validation schemas
export const reviewSchemas = {
  create: Joi.object({
    title: Joi.string().max(500).required(),
    excludedContentTypes: Joi.array().items(Joi.string()).default([]),
    objectType: Joi.string().valid('web', 'doc', 'app').required(),
    regulatoryFramework: Joi.string().max(100).required(),
    selectedPrefillIds: Joi.string().allow('').default(''),
  }),

  update: Joi.object({
    title: Joi.string().max(500).required(),
    excludedContentTypes: Joi.array().items(Joi.string()).default([]),
    objectType: Joi.string().valid('web', 'doc', 'app').required(),
    regulatoryFramework: Joi.string().max(100).required(),
    selectedPrefillIds: Joi.string().allow('').default(''),
  }),
};

export const checkSchemas = {
  upsert: Joi.object({
    requirement: Joi.string().max(100).required(),
    status: Joi.number().valid(0, 1, 2, 3).optional(),
    comment: Joi.string().allow('').optional(),
    flag: Joi.number().valid(0, 1).optional(),
  }),

  bulkRequirements: Joi.object({
    requirements: Joi.array().items(Joi.string().max(100)).min(1).required(),
  }),

  bulkPrefill: Joi.object({
    prefills: Joi.array().items(
      Joi.object({
        status: Joi.string().valid('PASS', 'FAIL', 'IRRELEVANT', 'NOT_ASSESSED').required(),
        ids: Joi.array().items(Joi.string().max(100)).min(1).required(),
        comment: Joi.string().allow('').default(''),
      })
    ).min(1).required(),
  }),

  toggleFlag: Joi.object({
    flag: Joi.boolean().required(),
  }),
};

// Param validation
export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id || req.params.reviewId, 10);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ 
      error: 'Invalid ID parameter',
      details: 'ID must be a positive number',
    });
  }
  
  next();
};
