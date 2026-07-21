<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function index(): JsonResponse
    {
        $latestInvoices = Invoice::with('customer')->latest()->limit(2)->get()->map(fn ($invoice) => [
            'timestamp' => $invoice->created_at, 'time' => $invoice->created_at->format('H:i'), 'type' => 'PAYMENT',
            'message' => 'Invoice '.$invoice->invoice_number.' untuk '.$invoice->customer->name,
            'meta' => $invoice->status,
        ]);
        $latestCustomer = Customer::latest()->first();
        $latestComplaint = Complaint::with('customer')->latest()->first();
        $activities = $latestInvoices
            ->when($latestCustomer, fn ($items) => $items->push(['timestamp' => $latestCustomer->created_at, 'time' => $latestCustomer->created_at->format('H:i'), 'type' => 'CUSTOMER', 'message' => 'Pelanggan '.$latestCustomer->name.' tersimpan di database', 'meta' => $latestCustomer->status]))
            ->when($latestComplaint, fn ($items) => $items->push(['timestamp' => $latestComplaint->created_at, 'time' => $latestComplaint->created_at->format('H:i'), 'type' => 'TICKET', 'message' => $latestComplaint->ticket_number.' — '.$latestComplaint->customer->name, 'meta' => $latestComplaint->status]))
            ->sortByDesc('timestamp')->take(4)->map(fn ($item) => collect($item)->except('timestamp')->all())->values();

        return response()->json(['data' => [
            'customers' => ['total' => Customer::count(), 'active' => Customer::where('status', 'ACTIVE')->count(), 'unpaid' => Customer::where('payment_status', 'UNPAID')->count()],
            'billing' => ['revenue' => Invoice::where('status', 'PAID')->sum('amount'), 'unpaid' => Invoice::where('status', 'UNPAID')->sum('amount')],
            'complaints' => ['open' => Complaint::where('status', 'OPEN')->count(), 'process' => Complaint::where('status', 'PROCESS')->count(), 'done' => Complaint::where('status', 'DONE')->count()],
            'activities' => $activities,
            'generated_at' => now()->toIso8601String(),
        ]]);
    }
}
