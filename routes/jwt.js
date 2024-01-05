const jwt = require('jsonwebtoken');


const secretKey = "SECRET_KEY";
console.log(secretKey)
function generateToken(phoneNumber) {
  return jwt.sign({ phoneNumber }, secretKey, { expiresIn: '1hr' }); // You can adjust the expiration time
}


function verifyToken(req, res, next) {
  if (!req || !req.headers) {
    return res.status(400).json({ message: 'Bad Request' });
  }
  const tokenHeader = req.headers.authorization;
  console.log("tokengeader" + tokenHeader)
  if (!tokenHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = tokenHeader.split(' ')[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    console.log("Token:", token);
    console.log("Secret key:", secretKey);
    console.log("Decoded:", decoded);

    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.phoneNumber = decoded;
    next();
  });
}



function generateRefreshToken(phoneNumber) {
  return jwt.sign({ phoneNumber }, secretKey, { expiresIn: '7d' }); // Use the same secret key
}

// Handle token refresh
function refreshToken(req, res) {
  const refreshToken = req.body.refreshToken;


  // Verify the refresh token
  jwt.verify(refreshToken, secretKey, (err, decoded) => {
    console.log("Refresh token:", refreshToken);
    console.log("Secret key:", secretKey);
    console.log("Decoded:", decoded);
    if (err) {
      console.error('Refresh token verification error:', err);
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Generate a new access token
    const newAccessToken = generateToken(decoded.phoneNumber);

    // Send the new access token to the client
    res.json({ accessToken: newAccessToken });
  });
}

module.exports = { generateToken, verifyToken, refreshToken, generateRefreshToken };