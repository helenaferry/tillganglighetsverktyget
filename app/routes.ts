import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('granskning/:id/:reqId', 'routes/review.tsx', { id: 'review-req' }),
  route('granskning/:id', 'routes/review.tsx', { id: 'review' }),
  route('granskning/skapa', 'routes/addReview.tsx'),
  route('granskning/:id/redigera', 'routes/editReview.tsx', { id: 'edit' }),
  route('granskning/:id/export/:type', 'routes/export.tsx', { id: 'export' }),
  route('krav', 'routes/requirements.tsx', { id: 'requirements' }),
] satisfies RouteConfig;
