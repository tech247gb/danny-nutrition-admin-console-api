const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JWT.
 * Expects the JWT to be in the Authorization header as 'Bearer <token>'.
 */
const authenticateToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'abc123', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log(user, "user");
    req.jwt_payload = user;
    console.log(req.jwt_payload, "req.jwt_payload");
    next();
  });
};

module.exports = authenticateToken;
