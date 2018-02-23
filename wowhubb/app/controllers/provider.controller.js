const httpStatus = require('http-status');
const Provider = require('../models/provider.model');

exports.addserviceprovider = async (req, res, next) => {
  const { provider, category, services } = req.headers;
  let providerlogo = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    providerlogo = fields.includes('0') ?
      req.files[0].filename : 'null';
  }

  const serviceprovider = await new Provider({
    provider,
    category,
    services,
    providerlogo,
  }).save();

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: serviceprovider,
  });
};

exports.addcategoryforprovider = async (req, res, next) => {
  const { providerid, category } = req.body;

  const categoryArray = [];

  await Provider.findByIdAndUpdate(providerid, { $set: { category: [] } },
    { safe: true, upsert: true, new: true });

  for (let i = 0; i < category.length; i += 1) {
    categoryArray.push(Provider.findByIdAndUpdate(providerid, { $push: { category: category[i] } },
      { safe: true, upsert: true, new: true }));
  }

  await Promise.all(categoryArray);

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: 'Category has been updated successfully',
  });
};

exports.getserviceproviders = async (req, res, next) => {
  const providers = await Provider.find({}, { category: 0 });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: providers,
  });
};

exports.getcategory = async (req, res, next) => {
  const { providerid } = req.body;

  const category = await Provider.findById(providerid, { category: 1, provider: 1 });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: category,
  });
};


// Dummy Data

const CAKES = [

  {
    shopname: 'Gina Cakes',
    address: 'Cakes by Gina, Bissonnet Street, Houston, Texas',
    country: 'US',
    openingtime: '7:00AM',
    phone: '713-555-5555',
    shoplogo: 'cake_img_1.png',
    rating: '4.0',
    url: 'www.ginacakes.com',
    latitude: '40.741895',
    longitude: '-73.989308',
    category: 'Cakes',
  },
  {
    shopname: 'Amazing Bakery',
    address: 'Amazing Bakery, Jos, Plateau',
    country: 'Nigeria',
    openingtime: '8:00AM',
    phone: '713-222-3335',
    shoplogo: 'cake_img_2.png',
    rating: '3.2',
    url: 'www.amazingbakery.com',
    latitude: '9.92113',
    longitude: '8.913639999999987',
    category: 'Cakes',
  },
  {
    shopname: 'Jessie Cake Point',
    address: 'r - R. Atol das Rocas, 1092 - Potengi, Natal - RN',
    country: 'Brazil',
    openingtime: '7:30AM',
    phone: '713-555-5555',
    shoplogo: 'cake_img_3.png',
    rating: '2.2',
    url: 'www.jessiecakepoint.com',
    latitude: '-5.7451386',
    longitude: '-35.25426229999999',
    category: 'Cakes',
  },

];


// Dummy Get Services

exports.getservices = async (req, res, next) => {
  try {
    // const id = req.user._id;
    // const { category } = req.body;

    // if (category === 'cake') {
    //   return res.json({
    //     success: true,
    //     code: httpStatus.OK,
    //     message: CAKES,
    //   });
    // }

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: CAKES,
    });
  } catch (error) {
    return next(error);
  }
};

exports.filterservice = async (req, res, next) => {
  try {
    const { country } = req.body;

    const serivce = CAKES.filter(x => x.country === country);

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: serivce,
    });
  } catch (error) {
    return next(error);
  }
};

