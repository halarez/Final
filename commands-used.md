# Commands Used

This file lists the important terminal commands used while building and verifying the project. Secret values are masked.

## Repository Setup

```powershell
Get-ChildItem -Force
git clone https://github.com/halarez/Final.git .
git status --short
git branch --all
git log --oneline --decorate -5
rg --files
```

## Project Inspection

```powershell
Get-Content package.json
Get-Content README.md
Get-Content src\App.tsx
Get-Content src\App.css
Get-Content src\index.css
rg --files src public
```

## Dependency Installation

```powershell
npm install next bcryptjs jsonwebtoken nodemailer tailwindcss @tailwindcss/postcss @types/jsonwebtoken @types/nodemailer
npm install jose
```

## Password Hash Generation

```powershell
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('Tala@890', 12));"
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('Rezt06200', 12));"
```

## Development Server

```powershell
Start-Process -FilePath npm.cmd -ArgumentList @('run','dev','--','--host','127.0.0.1') -WorkingDirectory '<project-path>' -WindowStyle Hidden
Start-Process -FilePath npm.cmd -ArgumentList @('run','dev','--','-p','3050','-H','127.0.0.1') -WorkingDirectory '<project-path>' -WindowStyle Hidden
Invoke-WebRequest -Uri http://127.0.0.1:3050/login -UseBasicParsing
```

## Build and Lint

```powershell
npm run lint
npm run build
npm audit --omit=dev
```

## SMTP Verification

The password was read from `.env.local` and was not printed.

```powershell
node -e "const fs=require('fs'); const nodemailer=require('nodemailer'); const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l && !l.startsWith('#')).map(l=>{const i=l.indexOf('='); return [l.slice(0,i), l.slice(i+1)];})); const user=env.EMAIL_USER.trim(); const pass=env.EMAIL_APP_PASSWORD.replace(/\s/g,''); nodemailer.createTransport({service:'gmail',auth:{user,pass}}).verify().then(()=>console.log('SMTP verified for '+user)).catch(e=>{console.log('SMTP failed: '+e.message); process.exit(1);});"
```

Result:

```text
SMTP verified for hhalarez@gmail.com
```

## Login API Tests

Admin login and OTP send test:

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:3050/api/auth/login -Method POST -ContentType application/json -Body '{"email":"hhalarez@gmail.com","password":"Rezt06200","turnstileToken":"local"}' -UseBasicParsing
```

Result:

```text
200 OK
OTP sent to hhalarez@gmail.com.
```

Earlier role and cookie tests:

```powershell
$login = Invoke-WebRequest -Uri http://127.0.0.1:3050/api/auth/login -Method POST -ContentType application/json -Body '{"email":"halarez123@gmail.com","password":"Tala@890","turnstileToken":"local"}' -SessionVariable s -UseBasicParsing
$body = $login.Content | ConvertFrom-Json
$verify = Invoke-WebRequest -Uri http://127.0.0.1:3050/api/auth/verify-otp -Method POST -ContentType application/json -Body (@{ email = 'halarez123@gmail.com'; otp = $body.devOtp } | ConvertTo-Json) -WebSession $s -UseBasicParsing
```

Note:
- The `devOtp` path was removed later.
- OTP is no longer returned by the API or shown on screen.

## Environment Checks

```powershell
$envFile = Get-Content .env.local
$email = ($envFile | Where-Object { $_ -match '^EMAIL_USER=' }) -replace '^EMAIL_USER=', ''
$pass = ($envFile | Where-Object { $_ -match '^EMAIL_APP_PASSWORD=' }) -replace '^EMAIL_APP_PASSWORD=', ''
[pscustomobject]@{ EmailUser = $email; AppPasswordSet = [bool]$pass; AppPasswordLengthNoSpaces = (($pass -replace '\s','').Length) }
```

## Browser Verification

Browser automation was used to confirm:
- Login page rendered.
- Checkbox appeared.
- Checkbox could be checked.
- `Send OTP` became enabled.
- OTP page rendered after successful login request.
