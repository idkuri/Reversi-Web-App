/**
 * Middleware to authenticate requests using an API key.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers['api-key'] - The API key provided in the request headers.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - Returns a 401 status with a message if the API key is missing or invalid.
 */
const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['api-key'];
  
    if(!apiKey){
      return res.status(401).json({ message: 'API Key field required'});
    }
  
    if (apiKey !== process.env.CHECKAPI) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  
    next();
  }

module.exports = apiKeyAuth;