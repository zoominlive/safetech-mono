const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.generateToken = (payload, expiresIn = '1d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

exports.verifyToken = token =>
  jwt.verify(token, process.env.JWT_SECRET);

exports.generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashed };
};
