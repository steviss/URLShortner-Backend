export const SuccessDispatch = (message: string, data: {} | []) => {
    return { status: 'success', message: message, data: data };
};
