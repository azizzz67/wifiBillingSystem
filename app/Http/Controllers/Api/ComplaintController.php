<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ComplaintController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Complaint::with('customer')->latest()->get()->map(fn ($item) => $this->transform($item))]);
    }

    public function update(Request $request, Complaint $complaint): JsonResponse
    {
        $data = $request->validate(['technician' => ['nullable', 'string', 'max:100'], 'status' => ['required', Rule::in(['OPEN', 'PROCESS', 'DONE'])]]);
        if ($data['status'] === 'DONE') {
            $data['resolved_at'] = now();
        }
        $complaint->update($data);

        return response()->json(['data' => $this->transform($complaint->fresh('customer'))]);
    }

    private function transform(Complaint $item): array
    {
        return ['db_id' => $item->id, 'id' => $item->ticket_number, 'customer' => $item->customer->name, 'issue' => $item->issue, 'description' => $item->description, 'date' => $item->created_at->format('d M Y'), 'priority' => $item->priority, 'status' => $item->status, 'technician' => $item->technician ?: 'Belum ditugaskan'];
    }
}
