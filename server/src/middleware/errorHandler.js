// Catches every error passed to next(err) so each controller doesn't
// need its own try/catch response formatting.

function errorHandler(err, req, res, next) {
    console.error(err);

    const status = err.status || 500;

    res.status(status).json({
        success: false,
        message: err.message || 'Something went wrong',
        errors: err.errors || undefined,
    });
}

export default errorHandler;