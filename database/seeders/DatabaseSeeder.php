<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\Customer;
use App\Models\InternetPackage;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminPassword = env('ADMIN_PASSWORD');
        if (! $adminPassword && app()->environment('production')) {
            throw new \RuntimeException('ADMIN_PASSWORD wajib diatur pada environment production.');
        }

        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@networkflow.com')],
            ['name' => env('ADMIN_NAME', 'Network Flow Admin'), 'password' => $adminPassword ?: 'networkflow'],
        );

        $packages = collect([
            ['name' => 'BASIC', 'speed_mbps' => 10, 'price' => 100000, 'color' => 'blue', 'device_limit' => 1, 'support_label' => 'Regular Support', 'is_popular' => false],
            ['name' => 'STANDARD', 'speed_mbps' => 20, 'price' => 150000, 'color' => 'yellow', 'device_limit' => 3, 'support_label' => 'Standard Support', 'is_popular' => true],
            ['name' => 'PREMIUM', 'speed_mbps' => 50, 'price' => 250000, 'color' => 'green', 'device_limit' => 10, 'support_label' => '24/7 Priority Support', 'is_popular' => false],
        ])->mapWithKeys(function ($data) {
            $package = InternetPackage::updateOrCreate(['name' => $data['name']], $data);

            return [$package->name => $package];
        });

        $customerRows = [
            ['NF-481', 'Alexander Vox', '+62 812-9044-1821', 'alexander@network.id', 'Jl. Teknologi No. 82, Jakarta', 'BASIC', 'ACTIVE', 'PAID'],
            ['NF-492', 'Sarah Jenkins', '+62 813-3220-1100', 'sarah@network.id', 'Cyber Way Suite 4B, Bandung', 'STANDARD', 'EXPIRED', 'UNPAID'],
            ['NF-504', 'Morgan Reed', '+62 812-7774-4333', 'morgan@network.id', 'Highpoint Ridge Apt 101, Bogor', 'PREMIUM', 'ACTIVE', 'PAID'],
            ['NF-512', 'Lana Thames', '+62 815-8812-2342', 'lana@network.id', 'East End Industrial Park, Depok', 'PREMIUM', 'ACTIVE', 'UNPAID'],
            ['NF-522', 'Chris Orton', '+62 811-2020-0404', 'chris@network.id', 'Downtown Loft Unit 9, Bekasi', 'BASIC', 'EXPIRED', 'UNPAID'],
            ['NF-534', 'Nadia Putri', '+62 877-4219-1200', 'nadia@network.id', 'Cendana Residence Blok C2, Tangerang', 'STANDARD', 'ACTIVE', 'PAID'],
            ['NF-547', 'Bima Saputra', '+62 856-3311-0088', 'bima@network.id', 'Jalan Merdeka No. 17, Jakarta', 'PREMIUM', 'ACTIVE', 'PAID'],
            ['NF-558', 'Dewi Ananda', '+62 838-9102-7654', 'dewi@network.id', 'Kota Baru Cluster 5, Bekasi', 'BASIC', 'ACTIVE', 'UNPAID'],
        ];

        $customers = collect($customerRows)->mapWithKeys(function ($row) use ($packages) {
            [$code, $name, $phone, $email, $address, $package, $status, $payment] = $row;
            $customer = Customer::updateOrCreate(['customer_code' => $code], ['name' => $name, 'phone' => $phone, 'email' => $email, 'address' => $address, 'internet_package_id' => $packages[$package]->id, 'status' => $status, 'payment_status' => $payment, 'joined_at' => now()->subMonths(6)->toDateString()]);

            return [$code => $customer];
        });

        $invoiceRows = [
            ['INV-9902', 'NF-481', 'JUL 2026', 'PAID'], ['INV-9903', 'NF-492', 'JUL 2026', 'UNPAID'],
            ['INV-9904', 'NF-504', 'JUL 2026', 'PAID'], ['INV-9905', 'NF-512', 'JUL 2026', 'UNPAID'],
            ['INV-9906', 'NF-534', 'JUL 2026', 'PAID'],
        ];
        foreach ($invoiceRows as [$number, $code, $period, $status]) {
            $customer = $customers[$code];
            Invoice::updateOrCreate(['invoice_number' => $number], ['customer_id' => $customer->id, 'internet_package_id' => $customer->internet_package_id, 'period' => $period, 'amount' => $customer->internetPackage->price, 'status' => $status, 'due_date' => now()->addDays(20)->toDateString(), 'paid_at' => $status === 'PAID' ? now() : null]);
        }

        $complaintRows = [
            ['TKT-204', 'NF-492', 'Internet terputus sejak pagi', 'HIGH', 'OPEN', null],
            ['TKT-198', 'NF-504', 'Kecepatan turun saat hujan', 'MEDIUM', 'PROCESS', 'Rizky A.'],
            ['TKT-191', 'NF-481', 'Router sering restart', 'LOW', 'DONE', 'Dimas R.'],
            ['TKT-187', 'NF-512', 'Lampu LOS menyala merah', 'HIGH', 'PROCESS', 'Rizky A.'],
            ['TKT-180', 'NF-522', 'Tidak dapat login WiFi', 'MEDIUM', 'DONE', 'Sari N.'],
        ];
        foreach ($complaintRows as [$ticket, $code, $issue, $priority, $status, $technician]) {
            Complaint::updateOrCreate(['ticket_number' => $ticket], ['customer_id' => $customers[$code]->id, 'issue' => $issue, 'description' => $issue, 'priority' => $priority, 'status' => $status, 'technician' => $technician, 'resolved_at' => $status === 'DONE' ? now() : null]);
        }
    }
}
