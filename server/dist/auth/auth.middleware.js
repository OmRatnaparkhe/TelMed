import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.sendStatus(401); // No token provided
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403); // Invalid token
        req.userId = user.userId;
        req.userRole = user.role;
        next();
    });
};
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};
