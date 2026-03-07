/**
 * Generic validation middleware using Zod
 * @param {import('zod').ZodSchema} schema
 * @param {string} [source='body'] - The part of the request to validate ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
    try {
        const validatedData = schema.parse(req[source]);
        // Update the request with validated (and transformed) data
        req[source] = validatedData;
        next();
    } catch (error) {
        if (error.name === 'ZodError') {
            const formattedErrors = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formattedErrors
            });
        }
        next(error);
    }
};
