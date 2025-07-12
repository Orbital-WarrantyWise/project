# WarrantyWise

## Motivation

Keeping track of warranties for various products (e.g. home appliances, electronics, or even monthly subscriptions) can be tedious. When a product malfunctions, users often struggle to locate warranty information, receipts, or expiration dates, leading to unnecessary expenses or delays in repair. This project aims to solve that problem by providing a centralized platform to store and manage warranty details efficiently.

Additionally, the platform can also help users track important reminders, such as freeware cancellations. Many services offer free premium trials for a limited time, only to start charging once the trial period ends. Users frequently forget to cancel in time, resulting in unwanted charges. This platform will send timely reminders for expiring warranties and upcoming subscription payments, helping users avoid unnecessary costs and stay in control of their finances.

## Aim

We hope to develop an intuitive and accessible web-based platform that allows users to store, manage, and search for warranty information efficiently. We also aim to make a simple phone application, cross-compatible on iOS and Android, to make it easy for users to access these documents from wherever, whenever. By leveraging AI, we aim to enhance search capabilities and potentially offer smart suggestions for replacements when a warranty expires.

## Getting Started

We have already deployed WarrantyWise on [Vercel](https://warrantywise-frontend.vercel.app/) for you to try out the app!

If you would like to deploy WarrantyWise locally, please follow the instructions located in the [Frontend](/frontend/README.md), [Backend](/backend/README.md), and [Database](/database/README.md) README files.

## Features

1. Users can add and store warranty details, including product name, product category, purchase date, expiration date, and documents such as receipts/invoices
2. Users can quickly search for warranties by product name, product category, purchase date, or expiration date
3. Users receive email or push notifications when warranties are nearing expiration
4. Users can scan and automatically extract warranty details from receipts or invoices (e.g. via OCR)
5. When a warranty expires, AI suggests similar or replacement products based on web searches (e.g. via OpenAI's Operator API)
6. Families or small businesses can share access and collectively manage warranties

## Roadmap

- Milestone 1 - Technical proof of concept (i.e., a minimal working system with both the frontend and the backend integrated for a very simple feature)
  - [x] Set up the project repository and establish the tech stack
  - [x] Develop the basic authentication system
  - [x] Implement a minimal frontend and backend integration
  - [x] Allow users to manually add warranty details (Feature 1)
  - [x] Deploy a simple working version on Vercel and Supabase
- Milestone 2 - Prototype (i.e., a working system with the core features)
  - [x] Implement the search functionality (Feature 2)
  - [ ] Develop email/push notifications for expiring warranties (Feature 3)
  - [ ] Improve the UI/UX for warranty management
  - [ ] Conduct user testing and iterate based on feedback
- Milestone 3 - Extended system (i.e., a working system with both the core + extension features)
  - [ ] Implement OCR-based warranty extraction (Feature 4)
  - [ ] Add AI-powered product suggestions (Feature 5)
  - [ ] Enable shared access for family/small business use (Feature 6)
  - [ ] Optimize performance, security, and mobile responsiveness
  - [ ] Conduct extensive testing and bug fixes
  - [ ] Deploy a stable version with all core and extension features

## Tech Stack

1. Frontend/Mobile: Expo
2. Backend: Express
3. Database: Supabase
4. Deployment: Vercel
5. AI Integration: OpenAI, Tesseract OCR
6. Notifications: Twilio
7. Authentication: NextAuth, Google SSO
8. Containerization: Docker

## Style Guide

We use an opinionated code formatter, [`Prettier`](https://prettier.io/), to handle the formatting for a fuss-free style guide that supports multiple languages. Notably, we've configured some of the defaults to match our own styling:

- `arrowParens`: "avoid"
  - Avoiding clutter by omitting parentheses where possible
- `singleQuote`: true
  - Simply because
- `trailingCommas`: "all"
  - To standardise the ending of lines in commas, for easier reference as to where each line ends
- `printWidth`: 120
  - We find Prettier's default of 80 to be a bit too short to our liking

We've stuck to some of Prettier's sensible defauls, such as enforcing the use of semicolons. We do not enforce the variable/function naming conventions as there are 2 widely accepted interchangeable conventions used in React/React Native projects:

- camelCase
  - Used for general variables and functions
- CamelCase
  - Similar to the previous convention, except the first letter is also capitalised
  - Used for React/React Native functions used in rendering

Declaring a function in JavaScript via arrow function (e.g. `const add = (x, y) => x + y;`) or via function declaration (e.g. `function add(x, y) { return x + y; }`) is accepted.
