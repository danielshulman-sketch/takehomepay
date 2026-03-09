# Take-Home Pay Tracker

Next.js app for tracking shifts and estimating UK take-home pay for 4-week pay periods.

## Requirements

- Node.js 20+
- A PostgreSQL database

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file from the template and set your database URL:

```bash
cp .env.example .env
```

3. Generate Prisma client and apply schema:

```bash
npx prisma generate
npx prisma db push
```

4. (Optional) Seed initial data:

```bash
npx prisma db seed
```

5. Start development server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Useful scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint app
- `npm run typecheck` - TypeScript check
