// Validation & Sanitization Middleware
// Implements CSRF/XSS mitigations and input sanitization

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key].trim());
      }
    }
  }
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key].trim());
      }
    }
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { username, email, password, roleId } = req.body;

  if (username && username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  if (!roleId || ![1, 2].includes(Number(roleId))) {
    return res.status(400).json({ message: 'Please select a valid registration role (Tourist or Business Owner).' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email or username is required.' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  next();
};

const validateRestaurant = (req, res, next) => {
  const { name, address, latitude, longitude, municipalityId } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Restaurant name is required.' });
  }
  if (!address || address.trim().length === 0) {
    return res.status(400).json({ message: 'Business address is required.' });
  }
  if (!municipalityId) {
    return res.status(400).json({ message: 'Municipality selection is required.' });
  }
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Exact GPS location coordinates are required.' });
  }

  next();
};

const validateReview = (req, res, next) => {
  const { content, ratingValue } = req.body;

  if (!content || content.trim().length < 5) {
    return res.status(400).json({ message: 'Review content must be at least 5 characters long.' });
  }
  const rating = Number(ratingValue);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  next();
};

module.exports = {
  sanitizeInput,
  validateRegister,
  validateLogin,
  validateRestaurant,
  validateReview
};
