This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local Development & User Setup

Application authentication uses Laravel session-based Sanctum authentication (`/api/auth/login`). There is intentionally no public registration endpoint.

To create an authorized user for local development:

1. Launch Laravel Tinker in the backend environment:
   ```bash
   cd backend
   php artisan tinker
   ```

2. Provision an authorized local user with a password chosen locally:
   ```php
   User::create([
       'name' => 'Local Developer',
       'email' => 'dev@example.com',
       'password' => Hash::make('your-chosen-local-password'),
   ]);
   ```

3. Authenticate via the application Auth Gate UI using your local email and password.

*Security Note: Never commit plain-text passwords or production credentials into repository files or documentation.*
