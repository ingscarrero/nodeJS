
const DEFAULT_REASON = 'Ups! Something went wrong and, by now, we couldn\'t establish the reason. Please try again! If the problem persists contact the [SUPPORT_MAIL] by making reference to the following error ID:[ERROR_ID].';

const SUCCESS_CODE = 0;

export interface JsonResponse<T>{
    code: number;
    error?: Error;
    message?: T;
    reason?: string;
}

export function success<T>(message:T):JsonResponse<T>{
    return { code: SUCCESS_CODE, error: undefined, message };
}

export function error<T>(code: number, error: Error, message: T, reason = DEFAULT_REASON):JsonResponse<T>{
    console.error(error);
    return { code, error, message, reason };
}
