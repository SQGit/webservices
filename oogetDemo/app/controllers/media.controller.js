const path = require('path');

exports.jobseeker = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'jobseekermedia'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};


exports.company = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'companymedia'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};

exports.admin = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'adminmedia'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};

exports.featured = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '..', '..', 'public', 'featuredmedia'),
  };

  const filename = req.params.name;

  return res.sendFile(filename, options);
};

