<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['customer_code', 'name', 'phone', 'email', 'password', 'address', 'internet_package_id', 'status', 'payment_status', 'joined_at'];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['joined_at' => 'date', 'password' => 'hashed'];
    }

    public function getRouteKeyName(): string
    {
        return 'customer_code';
    }

    public function internetPackage(): BelongsTo
    {
        return $this->belongsTo(InternetPackage::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }
}
