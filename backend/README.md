<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


# 🏠 Roommate Compatibility System (Schools & Hostels)

## 📌 Project Overview

A **multi-organization backend system** that enables:

* 🏫 Schools (strict invite-only access)
* 🏨 Hostels (semi-controlled access)

to manage users and assign compatible roommates.

---

# 🧠 Core Principle

> **No user can access an organization without a valid invite**

This system enforces:

* Controlled onboarding
* Secure authentication
* Organization isolation

---

# 🏢 Organization Types

## 🏫 Schools (STRICT)

* Invite-only access
* Admin must send invite via email
* User cannot self-register without invite

---

## 🏨 Hostels (CONTROLLED FLEXIBILITY)

* Still invite-based (for now)
* Can later support request/booking flow

---

# 👥 Roles

## 🔴 SUPER_ADMIN

* Creates organizations
* Full system access
* Created manually in database

## 🟠 ORG_ADMIN

* Manages one organization
* Sends invites
* Manages users

## 🔵 USER

* Registers via invite
* Logs in normally after setup

---

# 🔐 AUTHENTICATION SYSTEM (UPDATED)

---

# ✉️ INVITE-BASED REGISTRATION (CORE FLOW)

## Step 1 — Admin Creates Invite

System generates:

* email
* organizationId
* **unique token**
* expiry time

---

## 🔑 Token Requirements

Every invite token must be:

* ✅ **Unique**
* ✅ **Random (unguessable)**
* ✅ **Single-use**
* ✅ **Time-limited**

---

## Step 2 — Email is Sent

User receives email like:

```
Hello,

You have been invited to join [Organization Name].

Click the link below to register:
http://yourapp.com/register?token=abc123XYZ

This link will expire in 24 hours.
```

---

## 🧠 IMPORTANT: Token Behavior

### If user:

* Doesn’t open email → token expires
* Requests resend → **new token is generated**
* Old token → becomes invalid

👉 **No two invites should ever share the same token**

---

## Step 3 — User Clicks Link

Frontend extracts token:

```js
const token = new URLSearchParams(window.location.search).get("token");
```

---

## Step 4 — Backend Validates Token

Checks:

* Token exists
* Status = `PENDING`
* Not expired

---

## ❌ If Invalid

Return:

```json
{
  "message": "Invalid or expired invite"
}
```

---

## ✅ If Valid

Allow user to:

* Enter name
* Set password
* Select gender

---

## Step 5 — Account Creation

System:

* Hashes password
* Creates user
* Links to organization
* Marks invite as `ACCEPTED`

---

## Step 6 — Login

User logs in using:

* email
* password

---

# 🔁 RESENDING INVITES (VERY IMPORTANT)

When admin resends an invite:

* ❌ DO NOT reuse old token
* ✅ Generate NEW token
* ❌ Old token becomes invalid or expired

---

## Recommended Approach

* Option 1:

  * Update existing invite with new token

* Option 2 (Better):

  * Mark old invite as `EXPIRED`
  * Create a new invite record

---

# 🔐 SECURITY RULES

* ❌ No token → No registration
* ❌ Used token → Denied
* ❌ Expired token → Denied
* ❌ Wrong email → Denied
* ✅ Only valid token → Access

---

# 🧬 DATABASE STRUCTURE (UPDATED)

## Invite Model

* id
* email
* token (unique)
* status:

  * PENDING
  * ACCEPTED
  * EXPIRED
* organizationId
* expiresAt
* createdAt

---

# 🧠 TOKEN GENERATION STRATEGY

Use something like:

```ts
import { randomBytes } from 'crypto';

const token = randomBytes(32).toString('hex');
```

This ensures:

* High randomness
* Impossible to guess

---

# 🏗 PROJECT STRUCTURE

```id="folderstructure"
src/
│
├── modules/
│   ├── auth/
│   ├── invite/
│   ├── organization/
│   ├── user/
│
├── prisma/
│   ├── prisma.service.ts
│   ├── prisma.module.ts
│
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── utils/
│
├── app.module.ts
```

---

# 📧 EMAIL SYSTEM (NEW)

## Responsibilities

* Send invite emails
* Include token in URL
* Handle resend logic

---

## Example Invite Link

```
http://localhost:3000/register?token=abc123XYZ
```

---

# ⚠️ COMMON MISTAKES

* ❌ Reusing tokens
* ❌ Allowing registration without token
* ❌ Not expiring tokens
* ❌ Not validating invite status
* ❌ Letting users choose organization manually

---

# 🧭 DEVELOPMENT FLOW (UPDATED)

1. ✅ Database + Prisma
2. ✅ Auth module setup
3. 🔄 Invite system (current focus)
4. ⏭ Email sending
5. ⏭ Registration with token
6. ⏭ Login
7. ⏭ Role guards

---

# 🧩 FINAL MENTAL MODEL

* Invite = **secure entry pass**
* Token = **one-time key**
* Registration = **account creation**
* Login = **return access**

---

# 📍 CURRENT STATE

You now have:

✅ Database ready
✅ Email system ready
🔄 Building invite + auth integration

---

# 🚀 NEXT STEP

Implement:

* Invite creation service
* Email sending with token
* Register endpoint with token validation

---

**This README is your blueprint. Follow it step by step.**
