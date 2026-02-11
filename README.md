# CentralKastoriaHouses React Migration

This project now runs as a React + Vite app.

## Scripts

- `npm install`
- `npm run dev` to start local development server
- `npm run typecheck` to run TypeScript checks
- `npm run build` to create a production build
- `npm run preview` to preview the production build
- `npm run test:visual:update` to generate/update visual snapshots
- `npm run test:visual` to verify all route screenshots against baseline

## What Was Migrated

- The original mirrored website files are preserved under `public/legacy`.
- React Router routes were added for:
  - `/`
  - `/diamerismata`
  - `/topo8esia`
  - `/epikoinwnia`
  - `/centralkastoriahouseone`
  - `/centralkastoriahousetwo`
- Old `.html` links are mapped to the new React routes.

## Visual Regression

- Playwright tests live in `tests/visual-routes.spec.ts`.
- Baseline images are stored in `tests/visual-routes.spec.ts-snapshots`.
- The test suite checks every migrated route to keep visuals stable during refactors.
