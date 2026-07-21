<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Invoice::with(['customer', 'internetPackage'])->latest()->get()->map(fn ($invoice) => $this->transform($invoice))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['customer_id' => ['required', 'exists:customers,customer_code'], 'period' => ['required', 'string', 'max:30'], 'due_date' => ['required', 'date'], 'status' => ['sometimes', 'in:PAID,UNPAID']]);
        $customer = Customer::with('internetPackage')->where('customer_code', $data['customer_id'])->firstOrFail();
        $invoice = Invoice::create(['invoice_number' => 'INV-'.now()->format('ymdHis').random_int(10, 99), 'customer_id' => $customer->id, 'internet_package_id' => $customer->internet_package_id, 'period' => $data['period'], 'amount' => $customer->internetPackage->price, 'status' => $data['status'] ?? 'UNPAID', 'due_date' => $data['due_date']])->load(['customer', 'internetPackage']);

        return response()->json(['data' => $this->transform($invoice)], 201);
    }

    private function transform(Invoice $invoice): array
    {
        return ['id' => $invoice->invoice_number, 'customer' => $invoice->customer->name, 'customer_id' => $invoice->customer->customer_code, 'email' => $invoice->customer->email, 'package' => $invoice->internetPackage->name, 'period' => $invoice->period, 'amount' => $invoice->amount, 'status' => $invoice->status, 'due_date' => $invoice->due_date->toDateString()];
    }
}
