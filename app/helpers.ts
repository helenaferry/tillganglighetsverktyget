import { type RequirementWithCheck, Status } from './data/types';

export function numberChecked(requirements: RequirementWithCheck[]) {
  return requirements.filter(
    (req) =>
      req.check?.status === Status.PASS ||
      req.check?.status === Status.FAIL ||
      req.check?.status === Status.IRRELEVANT,
  ).length;
}

export function percentageChecked(requirements: RequirementWithCheck[]) {
  const totalCount = requirements.length;
  if (totalCount === 0) return 0;
  const checkedCount = numberChecked(requirements);
  return (checkedCount / totalCount) * 100;
}

export function numberPerStatus(requirements: RequirementWithCheck[]) {
  const passCount = requirements.filter((req) => req.check?.status === Status.PASS).length;
  const failCount = requirements.filter((req) => req.check?.status === Status.FAIL).length;
  const irrelevantCount = requirements.filter(
    (req) => req.check?.status === Status.IRRELEVANT,
  ).length;
  const notAssessedCount = requirements.filter(
    (req) => !req.check || req.check.status === Status.NOT_ASSESSED,
  ).length;

  return { passCount, failCount, irrelevantCount, notAssessedCount };
}
