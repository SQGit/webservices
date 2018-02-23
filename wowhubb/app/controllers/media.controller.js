const path = require('path');

exports.event = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'eventmedia'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};

exports.personal = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'personalmedia'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};

exports.provider = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'providerlogo'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};


exports.nearby = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'nearbyevent'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};
