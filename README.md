# 📝 DocuSync

> **AI-Native Full Stack Developer Assignment** | Ajaia LLC
> **Candidate:** Filjumar Jumamoy (devfiljumar@gmail.com)

---

## 📋 Overview

DocuSync is a lightweight collaborative document editor built with Laravel, Inertia.js, React, and Tiptap. It enables teams to create, edit, share, and import documents with rich-text formatting—inspired by Google Docs but purpose-built for this assignment.

> **"Write. Share. Collaborate."**

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📄 **Create & Edit Documents** | Rich-text editing with Tiptap (Bold, Italic, Underline, Headings, Lists) |
| 💾 **Auto-Save** | Never lose your work with 800ms debounced saving |
| 📤 **File Import** | Upload .txt, .md, and .docx files → auto-create documents |
| 👥 **Document Sharing** | Share with view/edit permissions via email |
| 🗑️ **Document Management** | Create, rename, and delete documents |
| 🔒 **Authentication** | Secure login with Laravel Breeze |
| 📱 **Responsive UI** | Clean, modern design with Tailwind CSS |

---

## 🚀 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Laravel 11 | API endpoints, authentication, business logic |
| **Frontend** | React 19 + TypeScript | UI components, state management |
| **Framework** | Inertia.js | Server-side rendering, SPA-like experience |
| **Editor** | Tiptap (ProseMirror) | Rich-text editing with formatting |
| **Database** | SQLite | Lightweight, file-based persistence |
| **Styling** | Tailwind CSS 4 | Utility-first, responsive styling |
| **Auth** | Laravel Breeze | Authentication scaffolding |
| **File Parsing** | PHPWord, Parsedown | DOCX and Markdown parsing |

---

## 🏁 Quick Start

```bash
# 1. Clone the repository
git clone [repository-url]
cd docu-sync

# 2. Install dependencies
composer install
npm install

# 3. Configure environment
cp .env.example .env
# Update DB_CONNECTION=sqlite
# Update DB_DATABASE=/absolute/path/to/database/database.sqlite

# 4. Setup database
touch database/database.sqlite
php artisan migrate --seed
php artisan key:generate

# 5. Build and run
php artisan storage:link
npm run build
php artisan serve
npm run dev  # In a separate terminal


# Access the Application
## Local: http://localhost:8000
## Login: user@demo.com / password AND user2@demo.com / password