# Phase 7.3: Diff Old Client vs New Client (non–data-layer)

This document summarizes the file-by-file comparison between **Old Client** (`tillganglighetsverktyget-client-only/tillganglighetsverktyget`) and **New Client** (`tillganglighetsverktyget/client`) for app code (excluding tests and data-layer implementation). Only non–data-layer improvements were considered for application to New Client.

## Scope

- **Compared:** components, routes, hooks, helpers, lang, app.css.
- **Not merged:** data layer (apiClient, reviewService, requirementService); design-system version (Old 34.x vs New 32.x); structural differences (e.g. Old `app/helpers/formattingHelpers.ts` vs New `app/formattingHelpers.ts`).

## Summary of differences

| Area | Old vs New | Action |
|------|------------|--------|
| **ProgressBar** | Old: DigiTypography wrapper, `bg-natthimmel-800`. New: no wrapper, `bg-stratos-500`. | Keep New (design/theme). |
| **ResetButton** | Old: `afType="reset"`. New: `afType="button"`. | Applied: set `afType="reset"` in New for semantics. |
| **StyledLink** | Old: `onClick` prop, `natthimmel-800`. New: scroll-to-top + `stratos-500`. | Keep New (behavior and theme). |
| **CategoryNav** | Old: uses i18n for CheckedLabel, UncheckedLabel, RequirementsChecked, NoCategoriesAvailable, NoRequirementsAvailable. New: hardcoded Swedish strings in places. | Applied: added i18n keys and use `t()` in CategoryNav. |
| **svenska.json** | Old: CategoryNav has CheckedLabel, UncheckedLabel, RequirementsChecked; Process Step2Description shorter. | Applied: added CategoryNav keys; Step2Description left as-is (optional copy tweak). |
| **Other components** | Various (CardsOrTable, Export, Footer, Header, Process, ReviewForm, etc.): design tokens (natthimmel vs stratos), minor API/design-system differences. | Keep New; no data-layer or structural changes. |
| **Routes** | Differ in data loading (Supabase vs API) and minor copy/structure. | Keep New (API-based). |
| **useReviewData** | Old: Supabase. New: API. | Keep New. |
| **app.css** | Minor differences. | Keep New. |

## Changes applied to New Client (Phase 7.3)

1. **client/app/lang/svenska.json**
   - Added under `CategoryNav`: `CheckedLabel`, `UncheckedLabel`, `RequirementsChecked` (for parity with Old and for use in CategoryNav).

2. **client/app/components/CategoryNav.tsx**
   - Replaced hardcoded "Inga kravkategorier tillgängliga" with `t('CategoryNav.NoCategoriesAvailable')`.
   - Replaced hardcoded "Inga krav tillgängliga" with `t('CategoryNav.NoRequirementsAvailable')`.
   - StatusIndicator: use `t('CategoryNav.CheckedLabel')` / `t('CategoryNav.UncheckedLabel')` for `aria-label`.
   - getCategoryStatus: use `t('CategoryNav.RequirementsChecked', { checked, total })` for `aria-label`.

3. **client/app/components/ResetButton.tsx**
   - Set `afType="reset"` (was `"button"`) for semantic reset button.

## Not applied (intentional)

- Design-system version bump (32.x → 34.x): would require validating component tests and API changes.
- Color/token changes (natthimmel vs stratos): New Client theme kept.
- StyledLink `onClick` and scroll behavior: New Client behavior kept.
- Any change to apiClient, reviewService, or requirementService.
