<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UpworkConnection extends Model
{
    protected $fillable = [
        'provider',
        'client_id',
        'access_token',
        'refresh_token',
        'token_type',
        'scope',
        'expires_at',
        'org_uid',
        'account_name',
        'account_role',
        'account_status',
        'is_active',
        'raw_metadata',
    ];


    /**
     * Attributes that MUST NEVER be serialized into JSON responses or logs.
     *
     * @var list<string>
     */
    protected $hidden = [
        'access_token',
        'refresh_token',
        'org_uid',
        'raw_metadata',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'org_uid' => 'encrypted',
            'raw_metadata' => 'encrypted:array',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the currently active connection.
     */
    public static function active(): ?self
    {
        return static::where('provider', 'upwork')
            ->where('is_active', true)
            ->latest('id')
            ->first();
    }

    /**
     * Check if token is expired or close to expiration (within 120 seconds).
     */
    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }

        return $this->expires_at->isPast() || $this->expires_at->diffInSeconds(now(), false) > -120;
    }
}

