# Network Flow

WiFi Customer Management System berbasis Laravel 12, React, PostgreSQL/SQLite, dan Laravel Sanctum.

## Local development

```bash
composer install
npm install
php artisan migrate --seed
composer run dev
```

Login lokal awal:

- Email: `admin@networkflow.com`
- Password: `networkflow`

Ubah melalui `ADMIN_EMAIL` dan `ADMIN_PASSWORD` sebelum production.

## Railway + PostgreSQL

1. Deploy repository sebagai App Service.
2. Tambahkan service PostgreSQL pada project Railway.
3. Tambahkan variable berikut pada App Service:

```dotenv
APP_NAME="Network Flow"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:generate-with-php-artisan-key-generate
APP_URL=https://your-domain.up.railway.app
APP_TIMEZONE=Asia/Jakarta
DB_CONNECTION=pgsql
DB_URL=${{Postgres.DATABASE_URL}}
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
LOG_CHANNEL=stderr
ADMIN_NAME="Network Flow Admin"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-long-random-password
VITE_API_BASE_URL=/api
```

`railway.json` menjalankan build frontend, health check `/up`, serta `railway/init-app.sh` sebagai pre-deploy. Script tersebut menjalankan migration, seeder idempotent, dan production cache. Deployment sengaja akan gagal jika `ADMIN_PASSWORD` tidak tersedia di environment production.

Data aplikasi disimpan pada tabel relasional `internet_packages`, `customers`, `invoices`, dan `complaints`; data React tidak lagi menjadi sumber penyimpanan.
