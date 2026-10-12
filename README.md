# InnKeep Express

Guest side of a hotel booking app: browse rooms, book a stay, pay with Xendit, and look up or cancel a booking.

## Tech stack

Built with the [T3 Stack](https://create.t3.gg/) (create-t3-app 7.40).

| Part | Tool |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) with [React 19](https://react.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| API | [tRPC 11](https://trpc.io) with [TanStack Query 5](https://tanstack.com/query) and [Zod 3](https://zod.dev) for input checks |
| Database | [PostgreSQL](https://www.postgresql.org) on [Supabase](https://supabase.com), through [Prisma 6](https://prisma.io) |
| Payments | [Xendit](https://www.xendit.co) hosted invoices (test mode) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) and [Lucide](https://lucide.dev) icons |
| Tooling | ESLint and Prettier |

## Setup

You need [Node.js](https://nodejs.org) 20 or newer.

1. Install the packages. This also generates the Prisma client.

   ```bash
   npm install
   ```

2. Create your `.env` file from the template:

   ```bash
   cp .env.example .env
   ```

   Then fill it in:

   - **Xendit:** make your own free [Xendit](https://dashboard.xendit.co) account and switch to **Test mode**.
     - `XENDIT_SECRET_KEY`: Settings > API Keys > generate a secret key (starts with `xnd_development_`).
     - `XENDIT_CALLBACK_TOKEN`: Settings > Webhooks > Verification token.
   - **Database:** pick one.
     - **Local:** keep the `localhost` `DATABASE_URL` from the template and put in your own PostgreSQL password. Then create the tables and rooms:

       ```bash
       npm run db:push
       npm run db:seed
       ```

     - **Shared Supabase:** ask the team for the Supabase `DATABASE_URL` and paste it in. It already has the tables and rooms, so skip `db:push` and `db:seed`.
   - **`AUTH_SECRET`:** any long random string. Generate one with:

     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```

3. Start the app at http://localhost:3000.

   ```bash
   npm run dev
   ```

## Guest pages

| Page | What it does |
|---|---|
| `/` | Room catalog, filtered by dates and number of guests |
| `/checkout` | Guest details, then off to Xendit to pay |
| `/find-booking` | Look up a booking by its code (IKX-1234) |
| `/booking/[code]` | Booking details, and cancel with the guest name |

## API (tRPC)

| Procedure | What it does |
|---|---|
| `room.getAll` | Rooms that fit the guests and, if dates are given, are free on those dates |
| `room.getById` | One room |
| `reservation.create` | Books a room and returns the Xendit payment link |
| `reservation.getByCode` | A booking with its room |
| `reservation.cancel` | Cancels a booking (code and guest name must match) |

Xendit calls `POST /api/webhooks/xendit` when a guest pays (the booking becomes CONFIRMED) or the payment link expires (the booking becomes CANCELLED). Xendit cannot reach `localhost`, so the booking stays PENDING when running locally. To test payments, deploy the app or use a tunnel such as ngrok, then set the webhook URL in the Xendit dashboard and `APP_URL` in `.env`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run db:push` | Create or update the database tables from `prisma/schema.prisma` |
| `npm run db:seed` | Add the 8 rooms (safe to run again) |
| `npm run db:studio` | Open Prisma Studio to view the data |
| `npm run check` | Lint and type check |
