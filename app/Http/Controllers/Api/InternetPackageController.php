<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InternetPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InternetPackageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => InternetPackage::withCount('customers')->orderBy('price')->get()->map(fn ($item) => $this->transform($item))]);
    }

    public function store(Request $request): JsonResponse
    {
        $package = InternetPackage::create($this->validated($request));

        return response()->json(['data' => $this->transform($package)], 201);
    }

    public function update(Request $request, InternetPackage $package): JsonResponse
    {
        $package->update($this->validated($request, $package));

        return response()->json(['data' => $this->transform($package->fresh()->loadCount('customers'))]);
    }

    private function validated(Request $request, ?InternetPackage $package = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('internet_packages')->ignore($package?->id)],
            'speed_mbps' => ['required', 'integer', 'min:1', 'max:100000'], 'price' => ['required', 'integer', 'min:1'],
            'color' => ['required', Rule::in(['blue', 'yellow', 'green'])], 'device_limit' => ['required', 'integer', 'min:1'],
            'support_label' => ['required', 'string', 'max:120'], 'is_popular' => ['sometimes', 'boolean'], 'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function transform(InternetPackage $item): array
    {
        return ['id' => $item->id, 'name' => $item->name, 'speed' => $item->speed_mbps.' Mbps', 'speed_mbps' => $item->speed_mbps, 'price' => $item->price, 'color' => $item->color, 'devices' => $item->device_limit.' Device Connections', 'device_limit' => $item->device_limit, 'support' => $item->support_label, 'support_label' => $item->support_label, 'popular' => $item->is_popular, 'users' => $item->customers_count ?? $item->customers()->count()];
    }
}
