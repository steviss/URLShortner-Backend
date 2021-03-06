export interface ErrorMessage {
    field: string;
    message: string;
}
export const ErrorDispatch = (field: string, message: string) => {
    return { status: 'error', errors: [{ field: field, message: message }] };
};

export const ErrorDispatchArray = (errors: ErrorMessage[]) => {
    return {
        status: 'error',
        errors: errors.map((error) => Object.assign({ field: error.field, message: error.message })),
    };
};
