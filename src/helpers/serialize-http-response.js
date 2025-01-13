module.exports = (statusCode, {
    result,
    error,
    message,
    stack
}) => {
    const response = {
        body: {
            result,
            error,
            message,
            stack,
            success: null,
        },
        headers: {
            'Content-Type': 'application/json'
        },
        statusCode
    };

    switch (statusCode) {
        case 200:
            response.body.success = true;
            break;

        case 400:
            response.body.success = false;
            break;

        case 401:
            response.body.success = false;
            break;

        case 409:
            response.body.success = false;
            break;

        case 500:
            response.body.success = false;
            break;

        default:
            response.body.success = false;
            break;
    }
    return response;
};