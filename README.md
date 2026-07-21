# WiFiKu

Aplikasi Flutter untuk pelanggan layanan WiFi. Implementasi saat ini mencakup
fondasi struktur fitur dan named routing untuk seluruh halaman utama.

## Menjalankan secara lokal

```shell
flutter pub get
flutter run
```

## Deployment Flutter Web di Railway

Repository menyediakan `Dockerfile` multi-stage. Flutter membangun target web,
kemudian Nginx menyajikan hasil build pada port yang diberikan Railway.

1. Buat project baru di Railway.
2. Pilih **Deploy from GitHub repo** dan hubungkan repository ini.
3. Railway akan mendeteksi `Dockerfile` di root repository.
4. Setelah deployment berhasil, buat domain pada menu **Networking**.

Endpoint health check tersedia pada `/health` dan dikonfigurasi melalui
`railway.toml`.
