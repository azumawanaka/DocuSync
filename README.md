# 📝 DocuSync

---

# Overview

DocuSync is a lightweight collaborative document editor built using Laravel, Inertia.js, React, and TypeScript.

The application demonstrates the core workflow of a collaborative document platform:

- Create documents
- Edit rich text
- Automatically save changes
- Upload supported files and convert them into documents
- Share documents with other users
- Persist documents between sessions

The project intentionally focuses on delivering a clean, working product slice within the assignment time constraints instead of recreating every Google Docs feature.

---

# Features

## Document Management

- Create new documents
- Rename documents
- Delete owned documents
- View owned documents
- View documents shared with the current user

---

## Rich Text Editor

Built using **Tiptap**.

Supported formatting:

- Bold
- Italic
- Underline
- Headings
- Bullet Lists
- Ordered Lists

Document content is automatically saved after editing.

---

## File Import

Supported file types:

- .txt
- .md
- .docx

Uploaded files are parsed on the server and converted into editable documents.

Libraries used:

- PHPWord
- Parsedown
- League CommonMark

---

## Document Sharing

Document owners can:

- Share documents by email
- Assign View permission
- Assign Edit permission
- Remove shared users
- Update permissions

Owned documents and shared documents are displayed separately.

---

## Authentication

Authentication is provided by Laravel Starter Kit (Fortify).

Demo users are seeded for testing.

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Backend | Laravel 13 |
| Frontend | React 19 |
| Language | TypeScript |
| Framework | Inertia.js |
| Styling | Tailwind CSS 4 |
| Rich Text | Tiptap |
| Database | SQLite |
| Authentication | Laravel Fortify |
| File Parsing | PHPWord, Parsedown, CommonMark |

---

# Installation

Clone the repository.

```bash
git clone <repository-url>
cd docu-sync
```

Install dependencies.

```bash
composer install
npm install
```

Create the environment file.

```bash
cp .env.example .env
```

Generate the application key.

```bash
php artisan key:generate
```

Create the SQLite database.

```bash
touch database/database.sqlite
```

Update your `.env`.

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/database/database.sqlite
```

Run migrations and seeders.

```bash
php artisan migrate --seed
```

Create the storage symlink.

```bash
php artisan storage:link
```

Start the development server.

```bash
composer run dev
```

Application:

```
http://localhost:8000
```

---

# Demo Accounts

Owner

```
Email:
user@demo.com

Password:
password
```

Shared User

```
Email:
user2@demo.com

Password:
password
```

---

# Project Structure

```
app/
 ├── Models
 ├── Http/Controllers
 ├── Services

resources/js/
 ├── components
 ├── pages
 ├── editor

database/
 ├── migrations
 ├── seeders
```

---

# Current Limitations

The assignment was intentionally scoped to fit the requested timebox.

Current limitations include:

- View-only users can still edit document content (backend permission exists, frontend restriction is pending)
- Delete action should only be visible to document owners
- Uploading files creates a new document instead of attaching to an existing one
- No real-time collaboration
- No version history
- No comments or suggestion mode

---

# What Works

- User authentication
- Document CRUD
- Rich text editing
- Auto-save
- File import
- Document sharing
- Permission updates
- SQLite persistence
- Responsive interface

---

# Future Improvements

With additional development time I would add:

- Real-time collaboration using Laravel Reverb
- Cursor presence
- Version history
- Comment threads
- PDF export
- Markdown export
- Search across documents
- Folder organization
- Activity log
- User avatars inside shared documents

---

# Assignment Notes

The goal of this project was to deliver a production-style implementation within a limited timeframe.

Priority was given to:

- Complete end-to-end document workflow
- Clean application architecture
- Maintainable Laravel + React codebase
- Functional sharing model
- Practical AI-assisted development
- Clear separation between backend and frontend responsibilities

Several non-essential features were intentionally deferred to keep the implementation focused and reliable.