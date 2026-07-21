<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\InternetPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::with('internetPackage')->latest();
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $term = '%'.$request->string('search')->trim().'%';
                $q->where('name', 'like', $term)->orWhere('customer_code', 'like', $term)->orWhere('email', 'like', $term);
            });
        }
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        return response()->json(['data' => $query->get()->map(fn (Customer $customer) => $this->transform($customer))]);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->load(['internetPackage', 'invoices' => fn ($q) => $q->latest()->limit(10), 'complaints' => fn ($q) => $q->latest()->limit(10)]);

        return response()->json(['data' => $this->transform($customer, true)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['customer_code'] = $this->nextCode();
        $data['internet_package_id'] = InternetPackage::where('name', $data['package'])->value('id');
        $data['payment_status'] = $data['payment'];
        unset($data['package'], $data['payment']);
        $customer = Customer::create($data)->load('internetPackage');

        return response()->json(['data' => $this->transform($customer)], 201);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $data = $this->validated($request, $customer);
        $data['internet_package_id'] = InternetPackage::where('name', $data['package'])->value('id');
        $data['payment_status'] = $data['payment'];
        unset($data['package'], $data['payment']);
        $customer->update($data);

        return response()->json(['data' => $this->transform($customer->fresh('internetPackage'))]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json(null, 204);
    }

    private function validated(Request $request, ?Customer $customer = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'phone' => ['required', 'string', 'min:9', 'max:30'],
            'email' => ['required', 'email', 'max:150', Rule::unique('customers')->ignore($customer?->id)],
            'address' => ['required', 'string', 'max:500'],
            'package' => ['required', Rule::exists('internet_packages', 'name')],
            'status' => ['required', Rule::in(['ACTIVE', 'EXPIRED', 'SUSPENDED'])],
            'payment' => ['required', Rule::in(['PAID', 'UNPAID'])],
        ]);
    }

    private function nextCode(): string
    {
        do {
            $code = 'NF-'.random_int(1000, 9999);
        } while (Customer::where('customer_code', $code)->exists());

        return $code;
    }

    private function transform(Customer $customer, bool $detail = false): array
    {
        $package = $customer->internetPackage;
        $data = [
            'id' => $customer->customer_code, 'name' => $customer->name,
            'initials' => collect(explode(' ', $customer->name))->map(fn ($word) => mb_substr($word, 0, 1))->take(2)->implode(''),
            'phone' => $customer->phone, 'email' => $customer->email, 'address' => $customer->address,
            'package' => $package->name, 'speed' => $package->speed_mbps.' Mbps', 'price' => $package->price,
            'status' => $customer->status, 'payment' => $customer->payment_status,
            'joined' => $customer->joined_at?->format('d M Y'),
        ];
        if ($detail) {
            $data['invoices'] = $customer->invoices->map(fn ($invoice) => ['id' => $invoice->invoice_number, 'period' => $invoice->period, 'amount' => $invoice->amount, 'status' => $invoice->status]);
            $data['complaints'] = $customer->complaints->map(fn ($complaint) => ['id' => $complaint->ticket_number, 'issue' => $complaint->issue, 'date' => $complaint->created_at->format('d M Y'), 'status' => $complaint->status]);
        }

        return $data;
    }
}
