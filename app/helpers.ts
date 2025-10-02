import { type RequirementWithCheck, Status } from './data/types';

export function numberChecked(requirements: RequirementWithCheck[]) {
  console.log(requirements.flatMap((req) => req.check?.status));
  return requirements.filter(
    (req) =>
      req.check?.status === Status.PASS ||
      req.check?.status === Status.FAIL ||
      req.check?.status === Status.IRRELEVANT,
  ).length;
}
