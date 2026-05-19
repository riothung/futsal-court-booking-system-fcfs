# Product Requirements Document (PRD)

## Sistem Booking Lapangan Futsal — FCFS Booking System

---

## 1. Overview

Sistem booking lapangan futsal berbasis web dengan:

- role-based access (admin dan user)
- metode booking First Come First Served (FCFS)
- pencegahan race condition saat booking
- autentikasi login
- dashboard admin untuk manajemen booking dan lapangan
- halaman booking khusus user

**Tech stack:**

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Express.js + TypeScript
- Database ORM: Prisma ORM
- Database: MySQL

---

## 2. Goals

### User Goals

- User dapat login dan melakukan booking lapangan dengan mudah.
- User tidak dapat membooking slot yang sudah dibooking orang lain.
- Booking diproses berdasarkan siapa yang lebih dulu submit.

### Admin Goals

- Admin dapat melihat seluruh data booking.
- Admin dapat mengelola lapangan dan jadwal booking.
- Admin dapat memonitor status booking.

### System Goals

- Mencegah double booking.
- Menangani race condition ketika banyak user booking slot yang sama.
- Mengimplementasikan role-based authorization dengan aman.

---

## 3. User Roles

### 3.1 Admin

**Hak akses:**

- Login
- Akses dashboard admin
- CRUD lapangan
- Melihat semua booking
- Mengelola booking (validasi manual)
- Melihat statistik booking

### 3.2 User

**Hak akses:**

- Login
- Melihat daftar lapangan
- Melakukan booking
- Melihat booking pribadi
- Melihat riwayat booking

**User tidak dapat:**

- Mengakses dashboard admin
- Mengakses API admin

---

## 4. Halaman

### Admin

- Dashboard (statistik booking)
- Daftar Lapangan (CRUD)
- Kelola Booking (lihat semua booking, validasi)

### User

- Halaman Booking (daftar lapangan + booking modal)
- Riwayat Booking (booking pribadi)

---

## 5. API Endpoints

### Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint         | Deskripsi                      |
| ------ | ---------------- | ------------------------------ |
| POST   | `/auth/register` | Registrasi user baru           |
| POST   | `/auth/login`    | Login                          |
| POST   | `/auth/logout`   | Logout                         |
| GET    | `/auth/me`       | Get user info (token required) |

### Data

| Method | Endpoint                    | Deskripsi                                     |
| ------ | --------------------------- | --------------------------------------------- |
| GET    | `/data/getCourt`            | Get semua lapangan                            |
| POST   | `/data/createCourt`         | Tambah lapangan (admin)                       |
| POST   | `/data/createBooking`       | Buat booking baru (token required)            |
| GET    | `/data/getMyBookings`       | Get booking user sendiri (token required)     |
| GET    | `/data/getAllBookings`      | Get semua booking (admin, token required)     |
| PUT    | `/data/updateBookingStatus` | Update status booking (admin, token required) |

---

## 6. Database Schema

### User

- id (Int, PK, autoincrement)
- phone_number (String)
- email (String, unique)
- password (String)
- username (String)
- role (String: "admin" / "client")
- created_at (DateTime)

### Court

- id (Int, PK, autoincrement)
- court_name (String)
- price_per_hour (Int)
- created_at (DateTime)

### Bookings

- id (Int, PK, autoincrement)
- id_user (Int, FK → User)
- id_court (Int, FK → Court)
- start_time (DateTime)
- end_time (DateTime)
- status (String: "PENDING" / "CONFIRMED" / "CANCELLED")
- created_at (DateTime)

---

## 7. Booking Flow

1. User login
2. User melihat daftar lapangan
3. User pilih lapangan dan tentukan jadwal
4. System cek ketersediaan slot (FCFS dengan race condition handling)
5. Booking dibuat dengan status "PENDING"
6. Admin melihat booking baru di dashboard
7. Admin memvalidasi/konfirmasi booking
8. Booking status berubah menjadi "CONFIRMED" atau "CANCELLED"
