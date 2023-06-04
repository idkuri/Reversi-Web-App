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