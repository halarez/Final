# Detailed Code Explanation

## Root Configuration Files

### `package.json`

This file defines the project name, scripts, dependencies, and dev dependencies.

Important scripts:
- `dev`: runs the Next.js development server.
- `build`: creates a production build.
- `lint`: checks the code with ESLint.
- `start`: runs the production server after building.

Important dependencies:
- `next`: framework used for frontend pages and backend API routes.
- `react` and `react-dom`: UI rendering.
- `bcryptjs`: compares login passwords with stored password hashes.
- `jsonwebtoken`: creates and verifies JWT tokens in server code.
- `jose`: verifies JWT tokens in middleware because middleware runs in an edge-compatible environment.
- `nodemailer`: sends OTP emails using Gmail SMTP.
- `tailwindcss`: styling system.

### `tsconfig.json`

This file configures TypeScript.

What it does:
- Enables strict type checking.
- Tells TypeScript to support JSX.
- Enables Next.js TypeScript plugin.
- Adds the path alias `@/*`, so imports like `@/src/lib/auth` work.
- Includes all `.ts` and `.tsx` files.

### `next.config.ts`

This is the Next.js configuration file.

Currently:
- It exports an empty config object.
- It exists so future Next.js options can be added easily.

### `postcss.config.mjs`

This connects Tailwind CSS to PostCSS.

What it does:
- Loads `@tailwindcss/postcss`.
- Allows `app/globals.css` to use Tailwind.

### `eslint.config.js`

This configures ESLint.

What it does:
- Checks TypeScript files.
- Uses recommended JavaScript and TypeScript lint rules.
- Ignores generated folders like `.next`, `dist`, and `node_modules`.

### `.env.local`

This stores secret local environment variables.

Used for:
- `JWT_SECRET`: signs JWT auth tokens.
- `EMAIL_USER`: Gmail sender account.
- `EMAIL_APP_PASSWORD`: Gmail App Password for SMTP.
- Optional Turnstile keys.

Important:
- This file should stay private.
- The Gmail App Password is not the app login password.

### `.env.example`

This is a template showing which environment variables are needed.

What it does:
- Helps setup on another computer or Vercel.
- Does not contain real secrets.

### `.gitignore`

This prevents private or generated files from being committed.

Important ignored files:
- `.env.local`
- `.otp-store.json`
- `.next`
- `node_modules`

## Middleware

### `middleware.ts`

This file protects routes before the page loads.

Code behavior:
1. Defines the auth cookie name: `auth_token`.
2. Defines public paths:
   - `/login`
   - `/api/auth/login`
   - `/api/auth/verify-otp`
3. Uses `jose` to verify the JWT token from cookies.
4. If the route is public, it allows access.
5. If no valid token exists, it redirects to `/login`.
6. If the user tries to access `/admin` without admin role, it redirects to `/grades`.
7. Otherwise, it allows the request.

Why `jose` is used:
- Next.js middleware is edge-compatible.
- `jsonwebtoken` is Node-oriented.
- `jose` works better in middleware.

## App Router Files

### `app/layout.tsx`

This is the root layout for all pages.

What it does:
- Imports global CSS.
- Sets metadata for the browser title and description.
- Wraps every page inside `<html>` and `<body>`.

### `app/page.tsx`

This is the homepage route `/`.

What it does:
- Immediately redirects users to `/login`.

### `app/globals.css`

This is the global stylesheet.

What it does:
- Imports Tailwind CSS.
- Sets the global page background.
- Sets default font behavior.
- Applies box sizing to all elements.

## Login Page

### `app/login/page.tsx`

This file renders the login page route.

What it does:
- Imports `LoginClient`.
- Returns the login component.

### `app/login/LoginClient.tsx`

This is the main login UI and frontend logic.

Important state:
- `step`: controls whether the user sees login form or OTP form.
- `email`: stores entered email.
- `password`: stores entered password.
- `otp`: stores entered OTP.
- `turnstileToken`: stores human verification token.
- `error`: stores error messages.
- `message`: stores success messages.
- `localVerified`: tracks whether the local checkbox is checked.
- `isLoading`: disables buttons while requests are running.

Human verification:
- If a real Turnstile site key exists, it renders Cloudflare Turnstile.
- If no site key exists locally, it shows a checkbox-style verification control.
- The `Send OTP` button is disabled until verification is complete.

Login submit flow:
1. Prevents normal form refresh.
2. Clears old errors.
3. Sends email, password, and verification token to `/api/auth/login`.
4. If login fails, shows the backend error.
5. If login succeeds, switches to OTP step.

OTP submit flow:
1. Sends email and OTP to `/api/auth/verify-otp`.
2. If OTP is invalid, shows an error.
3. If OTP is valid, redirects to the route returned by backend.

OTP input:
- Removes non-digit characters.
- Limits input to six digits.

## API Routes

### `app/api/auth/login/route.ts`

This backend route starts the login process.

Endpoint:
- `POST /api/auth/login`

Step-by-step:
1. Reads `email`, `password`, and `turnstileToken` from request body.
2. Validates that all required values exist.
3. Verifies the human verification token.
4. Normalizes the email to lowercase.
5. Finds the user in `src/lib/users.ts`.
6. If no user is found, returns invalid login error.
7. Compares the typed password with bcrypt hash.
8. If password is wrong, returns invalid login error.
9. Creates a six-digit OTP.
10. Saves the OTP with a five-minute expiry.
11. Sends OTP email through Gmail SMTP.
12. If email fails, returns an email configuration error.
13. If email succeeds, returns success message.

Security:
- It does not return the OTP to the frontend.
- It does not create a JWT until OTP is verified.

### `app/api/auth/verify-otp/route.ts`

This backend route finishes login after OTP.

Endpoint:
- `POST /api/auth/verify-otp`

Step-by-step:
1. Reads `email` and `otp`.
2. Validates both values exist.
3. Normalizes email.
4. Finds user.
5. Validates OTP from the OTP store.
6. If OTP is wrong or expired, returns error.
7. Creates JWT with email, role, and name.
8. Stores JWT in an HTTP-only cookie.
9. Redirect target is selected by role:
   - admin goes to `/admin/grades`
   - user goes to `/grades`

Cookie security:
- `httpOnly`: JavaScript cannot read the token.
- `sameSite: lax`: reduces CSRF risk.
- `secure`: enabled in production.
- `maxAge`: token lasts 8 hours.

### `app/api/auth/logout/route.ts`

This route logs the user out.

Endpoint:
- `POST /api/auth/logout`

What it does:
- Deletes the `auth_token` cookie.
- Returns `{ ok: true }`.

## Admin Page

### `app/admin/grades/page.tsx`

This is the admin grades dashboard.

What it does:
- Reads the JWT cookie.
- Verifies the logged-in user.
- Displays the signed-in email.
- Renders `AdminGradesManager`.
- Shows logout button.

Access:
- Middleware blocks non-admin users from this page.

## User Page

### `app/grades/page.tsx`

This is the normal user grades page.

What it does:
- Reads the JWT cookie.
- Verifies the logged-in user.
- Displays the signed-in email.
- Shows grades in read-only mode.
- Does not show add, edit, or delete controls.

Access:
- Authenticated users can open it.
- Normal users are redirected here if they try admin pages.

## Library Code

### `src/lib/users.ts`

This file stores users and roles.

Important types:
- `UserRole`: can be `admin` or `user`.
- `AppUser`: describes each user object.

Stored accounts:
- Admin: `halarez123@gmail.com`
- User: `tala463@gmail.com`

Important functions:
- `normalizeEmail(email)`: trims spaces and lowercases email.
- `findUserByEmail(email)`: finds a matching user or returns `null`.

Password security:
- Passwords are stored as bcrypt hashes.
- Plain passwords are never stored.

### `src/lib/hash.ts`

This file handles password comparison.

Function:
- `comparePasswords(password, passwordHash)`

What it does:
- Uses bcrypt to compare typed password with stored hash.
- Returns `true` if password matches.
- Returns `false` if it does not.

### `src/lib/auth.ts`

This file handles JWT tokens.

Type:
- `AuthTokenPayload`: contains email, role, and name.

Constants:
- `authCookieName`: cookie name is `auth_token`.
- `defaultJwtSecret`: local fallback secret.

Functions:
- `getJwtSecret()`: reads `JWT_SECRET` from env.
- `createAuthToken(payload)`: signs a JWT for 8 hours.
- `verifyAuthToken(token)`: verifies token and returns user data, or `null`.

Purpose:
- Keeps login session after OTP verification.

### `src/lib/otpStore.ts`

This file creates, saves, and validates OTP codes.

Important data:
- `OtpRecord`: stores OTP code and expiry time.
- `otpStore`: Map of email to OTP record.
- OTP expires after 5 minutes.

Functions:
- `createOtp()`: creates a random six-digit OTP.
- `saveOtp(email, code)`: saves OTP for that email.
- `validateOtp(email, code)`: checks if OTP is correct and not expired.

Local development:
- Saves OTPs to `.otp-store.json`.
- This prevents losing OTP if the dev server restarts.

Security:
- OTP is deleted after successful verification.
- Expired OTPs are deleted.
- Only the newest OTP for an email is valid.

### `src/lib/email.ts`

This file sends OTP emails.

Important functions:
- `createTransporter()`: creates Nodemailer Gmail transporter.
- `sendOtpEmail({ to, code })`: sends the OTP email.

Configuration:
- `EMAIL_USER`: Gmail sender.
- `EMAIL_APP_PASSWORD`: Gmail App Password.

Validation:
- Removes spaces from Gmail App Password.
- Requires 16-character app password.
- Returns clear error if config is missing or invalid.

Email content:
- Subject: grades portal verification code.
- Body: OTP code and 5-minute expiration message.

### `src/lib/turnstile.ts`

This file verifies human verification.

Function:
- `verifyTurnstileToken(token, remoteIp)`

Behavior:
- In local development, token `local` is accepted.
- In production, it sends token to Cloudflare Turnstile verification API.
- Returns `true` only if Cloudflare says the token is valid.

## Components

### `src/components/AdminGradesManager.tsx`

This is the admin CRUD component.

State:
- `grades`: list of grade records.
- `editingId`: tracks which row is being edited.
- `form`: stores form input values.

Stats:
- Counts unique students.
- Counts published grades.
- Counts grades needing review.

Functions:
- `resetForm()`: clears the form.
- `saveGrade(event)`: adds a new grade or saves an edit.
- `editGrade(grade)`: loads a grade into the form.
- `deleteGrade(id)`: removes a grade row.

UI:
- Stats cards.
- Add/edit form.
- Grades table with actions.

Important:
- Data is currently stored in React state.
- This means CRUD is frontend-only unless connected to a database later.

### `src/components/GradesTable.tsx`

This renders grade records in a table.

Type:
- `GradeRow`: id, student, course, grade, status.

Props:
- `grades`: rows to display.
- `canManage`: controls whether action buttons appear.
- `onEdit`: called when admin clicks Edit.
- `onDelete`: called when admin clicks Delete.

Admin mode:
- Shows Edit and Delete buttons.

User mode:
- Hides action buttons.
- Makes the page view-only.

### `src/components/LogoutButton.tsx`

This is the logout button.

What it does:
1. Sends `POST /api/auth/logout`.
2. Redirects browser to `/login`.

It is a client component because it uses browser navigation.

## Static Assets

### `public/favicon.svg`

Browser tab icon.

### `public/icons.svg`

Old icon sprite from starter project.

### `src/assets/hero.png`

Old image asset from starter project.

### `src/assets/react.svg`

Old React logo asset from starter project.

### `src/assets/vite.svg`

Old Vite logo asset from starter project.

These assets are not central to the authentication system.

## Complete Login Flow

1. User opens `/login`.
2. User enters email and password.
3. User clicks human verification checkbox.
4. Frontend sends login request.
5. Backend validates user credentials.
6. Backend sends OTP email.
7. User types OTP.
8. Backend validates OTP.
9. Backend creates JWT cookie.
10. User is redirected by role.

## Role Behavior

Admin:
- Email: `halarez123@gmail.com`
- Password: `Tala@890`
- Route: `/admin/grades`
- Permissions: add, edit, delete, view grades.

User:
- Email: `Tala463@gmail.com`
- Password: `Rezt06200`
- Route: `/grades`
- Permissions: view only.

## Security Summary

This project protects authentication by using:
- bcrypt password hashes
- OTP email verification
- JWT HTTP-only cookies
- middleware route protection
- role-based redirects
- email normalization
- OTP expiration
- human verification before OTP sending
