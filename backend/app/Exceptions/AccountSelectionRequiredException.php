<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

class AccountSelectionRequiredException extends Exception
{
    /**
     * @param array<int, array{id: int|string, name: string, role: string}> $candidateAccounts
     */
    public function __construct(
        public array $candidateAccounts = [],
        string $message = 'Multiple eligible TALENT accounts detected. Account selection required.',
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
