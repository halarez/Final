# Project Folder and File Report

## Root Folder

The root folder contains project configuration, documentation, authentication middleware, and package files.

### `.env.local`

Stores local environment variables.

Purpose:
- Holds `JWT_SECRET`
- Holds Gmail SMTP sender email
- Holds Gmail App Password
- Holds optional Turnstile keys

Important:
- This file should not be committed publicly.
- The Gmail App Password is used only for sending OTP emails.

### `.env.example`

Example environment variable file.

Purpose:
- Shows which environment variables are required.
- Helps deployment setup on Vercel.

Variables:
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_APP_PASSWORD`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

### `.gitignore`

Defines files and folders Git should ignore.

Ignores:
- `node_modules`
- `.next`
- local environment files
- local OTP storage
- build output
- editor files

### `README.md`

Main project documentation.

Includes:
- Project overview
- Features
- Default admin account
- Default user account
- Environment variables
- Available routes
- Scripts

### `architecture.md`

Contains architecture diagrams.

Includes:
- Login and OTP flow diagram
- System architecture diagram
- Important project files list

### `report.md`

This report file.

Purpose:
- Explains every folder and file in the project.
- Useful for project submission, review, or presentation.

### `package.json`

Defines project metadata, dependencies, and scripts.

Scripts:
- `npm run dev`: starts development server
- `npm run build`: builds production app
- `npm run lint`: runs ESLint
- `npm run start`: starts production server

Main dependencies:
- Next.js
- React
- TypeScript
- bcryptjs
- jsonwebtoken
- jose
- nodemailer
- Tailwind CSS

### `package-lock.json`

Locks exact installed dependency versions.

Purpose:
- Makes installs repeatable.
- Keeps package versions consistent.

### `tsconfig.json`

TypeScript configuration.

Purpose:
- Enables strict TypeScript checking.
- Configures Next.js TypeScript support.
- Adds path alias support for `@/*`.

### `next.config.ts`

Next.js configuration file.

Purpose:
- Stores Next.js project options.
- Currently uses default configuration.

### `next-env.d.ts`

Generated Next.js TypeScript declaration file.

Purpose:
- Adds Next.js types.
- Adds image import types.

### `postcss.config.mjs`

PostCSS configuration.

Purpose:
- Enables Tailwind CSS processing through `@tailwindcss/postcss`.

### `eslint.config.js`

ESLint configuration.

Purpose:
- Checks TypeScript and React code quality.
- Ignores build folders such as `.next` and `node_modules`.

### `middleware.ts`

Route protection middleware.

Purpose:
- Reads JWT auth cookie.
- Redirects unauthenticated users to `/login`.
- Blocks normal users from `/admin`.
- Allows admin users to access admin dashboard.

Security:
- Uses `jose` for middleware-safe JWT verification.
- Protects private pages before rendering.

## `app` Folder

The `app` folder contains Next.js App Router pages, layouts, styles, and API routes.

### `app/layout.tsx`

Root layout for the application.

Purpose:
- Defines global HTML structure.
- Loads `globals.css`.
- Sets metadata such as title and description.

### `app/page.tsx`

Home route.

Purpose:
- Redirects users from `/` to `/login`.

### `app/globals.css`

Global CSS file.

Purpose:
- Imports Tailwind CSS.
- Defines body background.
- Defines default font and global layout behavior.

## `app/login` Folder

Contains the login page UI and client-side login logic.

### `app/login/page.tsx`

Login page route.

Purpose:
- Renders the login client component.

### `app/login/LoginClient.tsx`

Main login and OTP frontend component.

Purpose:
- Displays email and password inputs.
- Displays human verification checkbox or Turnstile widget.
- Sends login request to `/api/auth/login`.
- Shows OTP input after email OTP is sent.
- Sends OTP verification request to `/api/auth/verify-otp`.
- Redirects user based on role.

Features:
- Loading states
- Error messages
- OTP input
- Local checkbox-style verification
- Real Turnstile support when keys are configured

## `app/api/auth` Folder

Contains backend authentication API routes.

### `app/api/auth/login/route.ts`

Login API route.

Endpoint:
- `POST /api/auth/login`

Purpose:
- Validates email, password, and human verification token.
- Normalizes email.
- Finds matching user.
- Compares password using bcrypt.
- Generates OTP.
- Saves OTP.
- Sends OTP to the entered email using Gmail SMTP.

Security:
- Does not return OTP to frontend.
- Requires valid credentials before OTP is sent.

### `app/api/auth/verify-otp/route.ts`

OTP verification API route.

Endpoint:
- `POST /api/auth/verify-otp`

Purpose:
- Validates email and OTP.
- Checks OTP expiry.
- Creates JWT after valid OTP.
- Stores JWT in HTTP-only cookie.
- Redirects admin to `/admin/grades`.
- Redirects user to `/grades`.

### `app/api/auth/logout/route.ts`

Logout API route.

Endpoint:
- `POST /api/auth/logout`

Purpose:
- Deletes the auth cookie.
- Logs user out.

## `app/admin` Folder

Contains admin-only pages.

### `app/admin/grades/page.tsx`

Admin grades dashboard.

Purpose:
- Shows admin dashboard header.
- Shows signed-in admin email.
- Renders grade management UI.

Access:
- Admin only.
- Normal users are redirected away by middleware.

## `app/grades` Folder

Contains user-accessible grades page.

### `app/grades/page.tsx`

User grades page.

Purpose:
- Shows signed-in user email.
- Displays grades in read-only mode.

Access:
- Admin and user can access if authenticated.
- Normal user only sees view-only table.

## `src` Folder

The `src` folder contains reusable application logic, components, and old/static assets.

## `src/lib` Folder

Contains backend helper logic for authentication, users, hashing, OTP, email, and verification.

### `src/lib/users.ts`

Stores application users.

Current users:
- Admin: `halarez123@gmail.com`
- Admin: `hhalarez@gmail.com`

Purpose:
- Defines user roles.
- Stores bcrypt password hashes.
- Provides `normalizeEmail()`.
- Provides `findUserByEmail()`.

Roles:
- `admin`
- `user`

### `src/lib/hash.ts`

Password hashing helper.

Purpose:
- Uses bcrypt to compare plain password input with stored password hash.

Main function:
- `comparePasswords()`

### `src/lib/auth.ts`

JWT authentication helper.

Purpose:
- Creates JWT tokens.
- Verifies JWT tokens.
- Defines auth cookie name.

Main values:
- `authCookieName = auth_token`

Main functions:
- `createAuthToken()`
- `verifyAuthToken()`

### `src/lib/otpStore.ts`

OTP storage and validation.

Purpose:
- Generates OTP.
- Saves OTP.
- Validates OTP.
- Deletes OTP after successful use.
- Expires OTP after 5 minutes.

Local development:
- Persists OTP to `.otp-store.json`.
- Prevents OTP loss after dev server restart.

### `src/lib/email.ts`

Email sending helper.

Purpose:
- Creates Gmail SMTP transporter.
- Sends OTP email using Nodemailer.
- Validates Gmail App Password configuration.

Uses environment variables:
- `EMAIL_USER`
- `EMAIL_APP_PASSWORD`

Important:
- `EMAIL_APP_PASSWORD` must be a 16-character Gmail App Password.
- App login passwords are not Gmail SMTP passwords.

### `src/lib/turnstile.ts`

Human verification helper.

Purpose:
- Verifies Cloudflare Turnstile token.
- Allows local development token `local` outside production.

Uses environment variable:
- `TURNSTILE_SECRET_KEY`

## `src/components` Folder

Contains reusable React UI components.

### `src/components/AdminGradesManager.tsx`

Admin grade management component.

Purpose:
- Allows admin to add grades.
- Allows admin to edit grades.
- Allows admin to delete grades.
- Shows dashboard statistics.

Permissions:
- Used only on admin dashboard.

### `src/components/GradesTable.tsx`

Reusable grades table.

Purpose:
- Displays grade rows.
- Shows actions only when `canManage` is true.

Admin mode:
- Shows edit and delete buttons.

User mode:
- Shows view-only grades.
- Currently no configured account has the `user` role because both login accounts are admin accounts.

### `src/components/LogoutButton.tsx`

Logout button component.

Purpose:
- Calls `/api/auth/logout`.
- Redirects user to `/login`.

## `src/assets` Folder

Contains static image assets from the original starter project.

### `src/assets/hero.png`

Image asset from original starter.

Current use:
- Not important to the authentication system.

### `src/assets/react.svg`

React logo from original starter.

Current use:
- Not important to the authentication system.

### `src/assets/vite.svg`

Vite logo from original starter.

Current use:
- Not important to the authentication system.

## `public` Folder

Contains public static files served by the app.

### `public/favicon.svg`

Browser favicon.

Purpose:
- Displays app icon in browser tab.

### `public/icons.svg`

Icon sprite from the original starter.

Current use:
- Not important to the authentication system.

## Removed Starter Files

The original Vite starter files were removed because the project was converted to Next.js.

Removed files:
- `index.html`
- `vite.config.ts`
- `src/App.tsx`
- `src/App.css`
- `src/main.tsx`
- `src/index.css`
- `tsconfig.app.json`
- `tsconfig.node.json`

Reason:
- Next.js App Router uses `app/` instead of Vite entry files.

## Summary

This project is now a secure Next.js authentication system with:

- Login page
- Role-based users
- bcrypt passwords
- OTP email verification
- Gmail SMTP
- JWT cookies
- Protected middleware routes
- Admin CRUD dashboard
- User read-only grades page
