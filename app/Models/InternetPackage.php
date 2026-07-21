<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternetPackage extends Model
{
    protected $fillable = ['name', 'speed_mbps', 'price', 'color', 'device_limit', 'support_label', 'is_popular', 'is_active'];

    protected function casts(): array
    {
        return ['price' => 'integer', 'is_popular' => 'boolean', 'is_active' => 'boolean'];
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
