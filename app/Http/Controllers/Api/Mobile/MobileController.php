<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Customer;
use App\Models\InternetPackage;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MobileController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);
        $customer = Customer::where('email', $credentials['email'])->first();

        if (! $customer || ! $customer->password || ! Hash::check($credentials['password'], $customer->password)) {
            throw ValidationException::withMessages(['email' => ['Email atau kata sandi tidak sesuai.']]);
        }
        if ($customer->status !== 'ACTIVE') {
            return response()->json(['success' => false, 'message' => 'Akun pelanggan tidak aktif.'], 403);
        }

        $deviceName = $credentials['device_name'] ?? 'android';
        $customer->tokens()->where('name', $deviceName)->delete();
        $token = $customer->createToken($deviceName, ['customer'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'token' => $token,
            'token_type' => 'Bearer',
            'data' => $this->customerData($customer->load('internetPackage')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['success' => true, 'message' => 'Logout berhasil.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->customerData($request->user()->load('internetPackage'))]);
    }

    public function updateMe(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'min:3', 'max:120'],
            'phone' => ['sometimes', 'string', 'min:9', 'max:30'],
            'email' => ['sometimes', 'email', 'max:150', Rule::unique('customers')->ignore($customer->id)],
            'address' => ['sometimes', 'string', 'max:500'],
        ]);
        $customer->update($data);

        return response()->json(['success' => true, 'message' => 'Profil berhasil diperbarui.', 'data' => $this->customerData($customer->fresh('internetPackage'))]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user()->load('internetPackage');
        $currentInvoice = $customer->invoices()->with('internetPackage')->latest('due_date')->first();

        return response()->json(['success' => true, 'data' => [
            'customer' => $this->customerData($customer),
            'package' => $this->packageData($customer->internetPackage),
            'network_status' => $customer->status,
            'current_invoice' => $currentInvoice ? $this->invoiceData($currentInvoice) : null,
            'unpaid_total' => (int) $customer->invoices()->whereIn('status', ['UNPAID', 'OVERDUE'])->sum('amount'),
            'recent_complaints' => $customer->complaints()->latest()->limit(3)->get()->map(fn (Complaint $item) => $this->complaintData($item)),
        ]]);
    }

    public function packages(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => InternetPackage::where('is_active', true)->orderBy('price')->get()->map(fn (InternetPackage $package) => $this->packageData($package))]);
    }

    public function invoices(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $request->user()->invoices()->with('internetPackage')->latest('due_date')->get()->map(fn (Invoice $invoice) => $this->invoiceData($invoice))]);
    }

    public function invoice(Request $request, string $invoice): JsonResponse
    {
        $item = $request->user()->invoices()->with('internetPackage')->where('invoice_number', $invoice)->firstOrFail();

        return response()->json(['success' => true, 'data' => $this->invoiceData($item)]);
    }

    public function complaints(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $request->user()->complaints()->latest()->get()->map(fn (Complaint $item) => $this->complaintData($item))]);
    }

    public function storeComplaint(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'min:3', 'max:150'],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'category' => ['required', Rule::in(['CONNECTION', 'SPEED', 'ROUTER', 'BILLING', 'OTHER'])],
            'priority' => ['required', Rule::in(['LOW', 'NORMAL', 'MEDIUM', 'HIGH'])],
        ]);
        $complaint = $request->user()->complaints()->create([
            'ticket_number' => 'TKT-'.now()->format('ymdHis').random_int(10, 99),
            'issue' => $data['subject'],
            'description' => $data['description'],
            'category' => $data['category'],
            'priority' => $data['priority'] === 'NORMAL' ? 'MEDIUM' : $data['priority'],
            'status' => 'OPEN',
        ]);

        return response()->json(['success' => true, 'message' => 'Pengaduan berhasil dikirim.', 'data' => $this->complaintData($complaint)], 201);
    }

    private function customerData(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'customer_id' => $customer->customer_code,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'status' => $customer->status,
            'payment_status' => $customer->payment_status,
            'package' => $customer->relationLoaded('internetPackage') && $customer->internetPackage ? $this->packageData($customer->internetPackage) : null,
        ];
    }

    private function packageData(InternetPackage $package): array
    {
        return ['id' => $package->id, 'name' => $package->name, 'speed' => $package->speed_mbps.' Mbps', 'speed_mbps' => $package->speed_mbps, 'price' => $package->price, 'device_limit' => $package->device_limit, 'support_label' => $package->support_label, 'is_popular' => $package->is_popular];
    }

    private function invoiceData(Invoice $invoice): array
    {
        return ['id' => $invoice->id, 'invoice_number' => $invoice->invoice_number, 'period' => $invoice->period, 'amount' => $invoice->amount, 'status' => $invoice->status, 'due_date' => $invoice->due_date?->toDateString(), 'paid_at' => $invoice->paid_at?->toIso8601String(), 'package' => $invoice->internetPackage ? $this->packageData($invoice->internetPackage) : null];
    }

    private function complaintData(Complaint $complaint): array
    {
        return ['id' => $complaint->id, 'ticket_number' => $complaint->ticket_number, 'subject' => $complaint->issue, 'description' => $complaint->description, 'category' => $complaint->category, 'priority' => $complaint->priority, 'status' => $complaint->status === 'PROCESS' ? 'IN_PROGRESS' : $complaint->status, 'technician' => $complaint->technician, 'created_at' => $complaint->created_at?->toIso8601String(), 'resolved_at' => $complaint->resolved_at?->toIso8601String()];
    }
}
