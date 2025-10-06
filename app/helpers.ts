import { type RequirementWithCheck, Status } from './data/types';

export function numberChecked(requirements: RequirementWithCheck[]) {
  return requirements.filter(
    (req) =>
      req.check?.status === Status.PASS ||
      req.check?.status === Status.FAIL ||
      req.check?.status === Status.IRRELEVANT,
  ).length;
}
