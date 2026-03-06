# Army QR Code Generator

A premium, modern QR code generator and digital business card management system built with React Router v7, Vite, and DaisyUI.

## 🚀 Features

- **Dynamic QR Code Generation**: Create and customize digital business cards with QR access.
- **Premium Design DNA**: Sleek, responsive, and minimalist UI using DaisyUI and Tailwind CSS.
- **Live Phone Preview**: See your profile changes in real-time with an interactive mobile mockup.
- **Theme System**: Create, edit, and apply custom branding themes including primary colors and legal information.
- **Identity Management**: Add multiple phone numbers, emails, and social media links (Instagram, LinkedIn, WhatsApp, etc.).
- **User Management**: Comprehensive administrator dashboard to manage system users and roles.
- **vCard Integration**: Direct "Save to Contacts" functionality on public profile cards.
- **Scan Analytics**: Track the performance of your QR codes with scan counters.

## 🛠️ Technology Stack

- **Frontend**: React Router v7, React 19, Lucide Icons, Framer Motion
- **Styling**: Tailwind CSS 4.0, DaisyUI
- **Backend/SSR**: React Router 7 Data API (Loaders/Actions)
- **Database**: MySQL (via `mysql2/promise`)
- **QR Generation**: `qrcode.react`

## 📦 Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-repo/army-qrcode.git
    cd army-qrcode
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure Environment:
    Create a `.env` file in the root directory:

    ```env
    DB_HOST=localhost
    DB_USER=your_user
    DB_PASSWORD=your_password
    DB_NAME=army_qrcode
    SESSION_SECRET=your_random_secret
    ```

4.  Database Setup:
    Execute the SQL schema found in `database/schema.sql` (if provided) or ensure your MySQL instance has the required tables.

5.  Run Development Server:
    ```bash
    npm run dev
    ```

## 🔐 Authentication

The system uses a secured cookie-based session management system. Initial administrator credentials must be manually seeded or registered via the `/register` route (if enabled).

## 📄 License

Internal use for Army Security. All rights reserved.
