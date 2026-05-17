import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'talenthub_super_secret_jwt_key_2026';

// Middleware to verify JWT token and inject user details
export const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied. Please log in.' });
  }

  // Expecting format: "Bearer <token>" or just "<token>"
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  if (!token) {
    return res.status(401).json({ msg: 'No token found in bearer header, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Contains id and role
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid. Session expired.' });
  }
};

// Middleware to restrict access based on user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Access denied. Role '${req.user?.role || 'Guest'}' is not authorized to access this resource.` 
      });
    }
    next();
  };
};
