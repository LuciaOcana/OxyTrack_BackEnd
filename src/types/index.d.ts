import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: any; // Puedes definir un tipo más específico en lugar de any si quieres
        }
    }
}
