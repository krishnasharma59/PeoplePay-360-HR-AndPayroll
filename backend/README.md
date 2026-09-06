# PeoplePay360 API

Express + MongoDB backend tailored to the patterns already present in your GLA coursework: ES modules, Express middleware, Mongoose models, JWT, bcrypt, dotenv, CORS, Helmet, Morgan, and separated routes/controllers/models.

## Run locally

1. Create `backend/.env` from `.env.example` and set `MONGO_URI` and `JWT_SECRET`.
2. In `backend`, run `npm install`.
3. Run `npm run dev`.
4. Confirm `GET http://localhost:8001/health` returns `status: ok`.

## Email delivery

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `backend/.env`. Password-reset codes and welcome emails are sent through this SMTP account. For Gmail, use `smtp.gmail.com`, port `465`, `SMTP_SECURE=true`, and a Google app password (not your regular Gmail password).

## Demo workflow

1. `POST /api/auth/register` with an HR or payroll manager role, then retain its returned token.
2. Add active employees with `POST /api/employees`.
3. Record attendance/overtime with `PUT /api/attendance` and submit/approve leave requests.
4. Create a payroll cycle: `POST /api/payroll-runs`.
5. Calculate it: `POST /api/payroll-runs/:id/calculate`.
6. Inspect risk flags in `GET /api/payroll-runs/:id/payslips`, then approve it.

Use `Authorization: Bearer <token>` on all routes except registration and login.

## Hackathon note

Payroll uses a visible demo formula: overtime is paid at 1.5× hourly base salary, unpaid leave is deducted at base salary / 22, and tax is 10%. The calculated payslip is a stored snapshot, so it remains historically correct when employee data changes later. Replace these constants with country-specific salary rules after the hackathon.
