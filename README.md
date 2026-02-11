# CentralKastoriaHouses

This project runs as a native React + Vite + TypeScript app.

## Scripts

- `npm install`
- `npm run dev` to start local development server
- `npm run typecheck` to run TypeScript checks
- `npm run build` to create a production build
- `npm run preview` to preview the production build
- `npm run test:visual:update` to generate/update visual snapshots
- `npm run test:visual` to verify all route screenshots against baseline

## Routes

- `/`
- `/diamerismata`
- `/topo8esia`
- `/epikoinwnia`
- `/centralkastoriahouseone`
- `/centralkastoriahousetwo`
- `/admin`

Legacy `.html` URLs are redirected to the route equivalents.

## Admin Image Upload

- Open `/admin` to manage apartment images.
- Choose an apartment and upload images.
- Uploaded images are stored in browser local storage and applied to:
  - apartment cards on `/diamerismata`
  - gallery images on `/centralkastoriahouseone` and `/centralkastoriahousetwo`
- To remove custom images, use the remove/clear actions on `/admin`.

## Visual Regression

- Playwright tests live in `tests/visual-routes.spec.ts`.
- Baseline images are stored in `tests/visual-routes.spec.ts-snapshots`.
- The test suite checks every migrated route to keep visuals stable during refactors.
