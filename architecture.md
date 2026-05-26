# Updated Project Architecture

## Current Accounts

```text
Admin 1
Email: halarez123@gmail.com
Password: Tala@890
Role: admin
Dashboard: /admin/grades

Admin 2 / Gmail Sender
Email: hhalarez@gmail.com
Password: Rezt06200
Role: admin
Dashboard: /admin/grades
SMTP sender: hhalarez@gmail.com
```

Both configured accounts are admin accounts. After successful OTP verification, both redirect to the admin dashboard.

## Authentication Flow

```mermaid
flowchart TD
  A["Open /login"] --> B["Enter email and password"]
  B --> C["Click I'm not a robot"]
  C --> D["POST /api/auth/login"]
  D --> E["Normalize email"]
  E --> F["Find account in src/lib/users.ts"]
  F --> G["Compare password with bcrypt hash"]
  G --> H["Generate 6 digit OTP"]
  H --> I["Save OTP with 5 minute expiry"]
  I --> J["Send OTP using Gmail SMTP"]
  J --> K["Show OTP form"]
  K --> L["User enters newest OTP from Gmail"]
  L --> M["POST /api/auth/verify-otp"]
  M --> N["Validate OTP"]
  N --> O["Create JWT auth token"]
  O --> P["Set HTTP-only auth_token cookie"]
  P --> Q{"User role"}
  Q -->|admin| R["Redirect to /admin/grades"]
  Q -->|user| S["Redirect to /grades"]
```

## System Architecture

```mermaid
flowchart LR
  Browser["Browser UI"] --> Login["app/login/LoginClient.tsx"]
  Login --> LoginAPI["app/api/auth/login/route.ts"]
  Login --> OtpAPI["app/api/auth/verify-otp/route.ts"]

  LoginAPI --> Turnstile["src/lib/turnstile.ts"]
  LoginAPI --> Users["src/lib/users.ts"]
  LoginAPI --> Hash["src/lib/hash.ts"]
  LoginAPI --> OtpStore["src/lib/otpStore.ts"]
  LoginAPI --> Email["src/lib/email.ts"]
  Email --> Gmail["Gmail SMTP<br/>hhalarez@gmail.com"]

  OtpAPI --> OtpStore
  OtpAPI --> Auth["src/lib/auth.ts"]
  Auth --> Cookie["HTTP-only JWT cookie"]

  Cookie --> Middleware["middleware.ts"]
  Middleware --> Admin["app/admin/grades/page.tsx"]
  Middleware --> Grades["app/grades/page.tsx"]
  Admin --> CRUD["src/components/AdminGradesManager.tsx"]
  Grades --> ReadOnly["src/components/GradesTable.tsx"]
```

## Role Architecture

```mermaid
flowchart TD
  Token["JWT contains role"] --> MW["middleware.ts checks role"]
  MW --> AdminCheck{"Path starts with /admin?"}
  AdminCheck -->|No| Allow["Allow authenticated route"]
  AdminCheck -->|Yes| RoleCheck{"role is admin?"}
  RoleCheck -->|Yes| AdminPage["Allow /admin/grades"]
  RoleCheck -->|No| UserPage["Redirect to /grades"]
```

## OTP Architecture

```mermaid
flowchart TD
  LoginOk["Password valid"] --> Create["createOtp()"]
  Create --> Save["saveOtp(email, code)"]
  Save --> Expiry["expiresAt = now + 5 minutes"]
  Save --> Persist["Local dev writes .otp-store.json"]
  Save --> Email["sendOtpEmail()"]
  Email --> Gmail["Gmail inbox"]
  Gmail --> Verify["User enters OTP"]
  Verify --> Normalize["Remove non-digits"]
  Normalize --> Match{"Matches stored code?"}
  Match -->|Yes| Delete["Delete OTP and create JWT"]
  Match -->|No| Error["Invalid or expired OTP"]
```

## Important Files

```text
app/login/LoginClient.tsx
app/api/auth/login/route.ts
app/api/auth/verify-otp/route.ts
app/api/auth/logout/route.ts
app/admin/grades/page.tsx
app/grades/page.tsx
middleware.ts

src/lib/users.ts
src/lib/hash.ts
src/lib/auth.ts
src/lib/otpStore.ts
src/lib/email.ts
src/lib/turnstile.ts

src/components/AdminGradesManager.tsx
src/components/GradesTable.tsx
src/components/LogoutButton.tsx
```
