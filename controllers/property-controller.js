const Property = require('../models/Property');
const { uploadS3 } = require('../libs/upload');
const multipleUpload = uploadS3.array('images');

class PropertyController {
  async get(req, res) {
    try {
      const properties = await Property.find();
      return res.status(200).json({ properties });
    } catch (err) {
      return res.status(500).json({ errorCode: 'database-error', message: err.message });
    }
  }

  async find(req, res) {
    const { name } = req.query;

    try {
      const properties = await Property.find({ name: { $regex: name, $options: 'i' } });
      return res.status(200).json({ properties });
    } catch (err) {
      return res.status(500).json({ errorCode: 'database-error', message: err.message });
    }
  }

  async create(req, res) {
    multipleUpload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ errorCode: 'network-error', message: err.message });
      }

      const imgFiles = req.files.map(({ location }) => location);
      const { name, description, address, lat, lng, images_meta } = req.body;

      if (!name) {
        return res.status(400).json({ errorCode: 'invalid-field', message: "name can't be blank" });
      }

      if (!description) {
        return res.status(400).json({ errorCode: 'invalid-field', message: "description can't be blank" });
      }

      if (!address) {
        return res.status(400).json({ errorCode: 'invalid-field', message: "address can't be blank" });
      }

      if (!lat) {
        return res.status(400).json({ errorCode: 'invalid-field', message: "lat can't be blank" });
      }

      if (!lng) {
        return res.status(400).json({ errorCode: 'invalid-field', message: "lng can't be blank" });
      }

      if (isNaN(lat)) {
        return res.status(400).json({ errorCode: 'invalid-field', message: 'lat should be number' });
      }

      if (isNaN(lng)) {
        return res.status(400).json({ errorCode: 'invalid-field', message: 'lng should be number' });
      }

      if (!images_meta) {
        return res.status(400).json({ errorCode: 'invalid-field', message: "images_meta can't be blank" });
      }

      if (imgFiles.length !== images_meta.length) {
        return res
          .status(400)
          .json({ errorCode: 'invalid-field', message: 'images_meta length should be same images length' });
      }

      try {
        const images = imgFiles.map((img, index) => ({
          url: img,
          description: images_meta[index]['description'],
          size: images_meta[index]['size'],
        }));
        const property = await Property.create({ name, description, address, lat, lng, images });
        return res.status(200).json({ property });
      } catch (dbError) {
        return res.status(500).json({ errorCode: 'database-error', message: dbError.message });
      }
    });
  }
}

const propertyController = new PropertyController();

module.exports = { propertyController };
