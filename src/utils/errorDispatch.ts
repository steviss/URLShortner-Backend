export interface ErrorMessage {
    field: string;
    message: string;
}
export const ErrorDispatch = (field: string, message: string) => {
    return { errors: [{ field: field, message: message }] };
};

export const ErrorDispatchArray = (errors: ErrorMessage[]) => {
    return {
        errors: errors.map((error) => Object.assign({ field: error.field, message: error.message })),
    };
};
