<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = ['invoice_number', 'customer_id', 'internet_package_id', 'period', 'amount', 'status', 'due_date', 'paid_at'];

    protected function casts(): array
    {
        return ['amount' => 'integer', 'due_date' => 'date', 'paid_at' => 'datetime'];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function internetPackage(): BelongsTo
    {
        return $this->belongsTo(InternetPackage::class);
    }
}
