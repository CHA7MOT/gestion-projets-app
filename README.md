# 📊 ProFlow — Project & Task Management Platform

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A modern, full-stack project and task tracking web application designed to streamline project workflows, monitor collaborator activities, and manage contractual milestones.

---

## ✨ Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- Token-based API authentication powered by **Laravel Sanctum**.
- Three distinct access levels tailored to company workflows:
  - **Admin**: Full control over projects, users, assignments, and contract documents (CPS).
  - **Supervisor**: Real-time project tracking, task validation, and incident/issue monitoring.
  - **User (Collaborator)**: Daily task logging, status updates, and issue/problem reporting.

### 📁 Project & Contract Management
- Creation and tracking of projects with client companies and timeline dates.
- Upload and storage of contractual specifications / files (*Cahier des Prescriptions Spéciales - CPS*).
- Multi-user project assignments.

### 📋 Task Monitoring & Issue Tracking
- Dynamic task logs categorized by type, reference, status, and assigned user.
- Incident & blocker reporting linked directly to specific tasks and projects.
- In-app notification center for activity updates and task alerts.

---

## 🛠️ Tech Stack

- **Backend**:
  - PHP 8.2+
  - Laravel 12 (RESTful API, Eloquent ORM)
  - Laravel Sanctum (Authentication)
  - MySQL / SQLite
- **Frontend**:
  - React 19 & React Router v7
  - Vite
  - Tailwind CSS v4 & Heroicons
  - Axios (HTTP client with interceptors)

---

## 🚀 Getting Started

### Prerequisites
- [PHP >= 8.2](https://www.php.net/)
- [Composer](https://getcomposer.org/)
- [Node.js >= 18](https://nodejs.org/) & npm

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Environment configuration
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env, then run migrations and seeders:
php artisan migrate --seed

# Create storage symlink for uploaded files (CPS, attachments)
php artisan storage:link

# Start the Laravel backend server
php artisan serve
```
### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev

```
Default Admin Account (from seeder):
Email: admin@admin.com

Password: password
