/**
 * Status enum matching frontend
 * Keep in sync with client/app/data/types.ts
 */
export enum Status {
  FAIL = 0,
  PASS = 1,
  IRRELEVANT = 2,
  NOT_ASSESSED = 3,
}

/**
 * Swedish text for status values
 * Keep in sync with client/app/data/types.ts StatusText enum
 */
export enum StatusText {
  FAIL = 'Underkänt',
  PASS = 'Godkänt',
  IRRELEVANT = 'Irrelevant',
  NOT_ASSESSED = 'Ej granskat',
}
