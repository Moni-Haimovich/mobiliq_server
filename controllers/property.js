const mongoose = require('mongoose');

const Property = require('../models/Property');
const { uploadS3 } = require('../libs/upload');
const multipleUpload = uploadS3.array('images');

class PropertyController {
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

  async addImages(req, res) {
    multipleUpload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ errorCode: 'network-error', message: err.message });
      }

      const imgFiles = req.files.map(({ location }) => location);
      const { _id, images_meta } = req.body;

      if (!_id) {
        return res.status(400).json({ errorCode: 'invalid-field', message: 'you should provide _id' });
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
        const property = await Property.findById(_id);
        if (!property) {
          return res.status(400).json({ errorCode: 'invalid-field', message: "property doesn't exist" });
        }

        const { images } = property.toJSON();
        const newImages = imgFiles.map((img, index) => ({
          url: img,
          description: images_meta[index]['description'],
          size: images_meta[index]['size'],
        }));

        await Property.findByIdAndUpdate({ _id }, { images: [...images, ...newImages] });
        res.status(400).json({ message: 'images added successfully' });
      } catch (dbError) {
        return res.status(500).json({ errorCode: 'database-error', message: dbError.message });
      }
    });
  }

  async removeImage(req, res) {
    const { propertyId, imageId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(422).json({ errorCode: 'invalid_field', message: 'property id should be ObjectID' });
    }

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(422).json({ errorCode: 'invalid_field', message: 'image id should be ObjectID' });
    }

    try {
      const property = await Property.findById({ _id: propertyId });

      if (!property) {
        return res.status(422).json({ errorCode: 'invalid_field', message: "property doesn't exist" });
      }

      const targetImg = property.images.find(({ _id }) => _id.toString() === imageId);

      if (!targetImg) {
        return res.status(422).json({ errorCode: 'invalid_field', message: "image doesn't exist" });
      }

      const images = property.images
        .filter(({ _id }) => _id.toString() !== imageId)
        .map(({ url, description, size }) => ({ url, description, size }));
      await Property.findByIdAndUpdate({ _id: propertyId }, { images });

      return res.status(200).json({ message: 'image deleted.' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ errorCode: 'database-error', message: err.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({ errorCode: 'invalid_field', message: 'id should be ObjectID' });
    }

    try {
      const property = await Property.findById({ _id: id });

      if (!property) {
        return res.status(422).json({ errorCode: 'invalid_field', message: "property doesn't exist" });
      }

      await Property.findByIdAndDelete({ _id: id });
      return res.status(200).json({ message: 'property deleted.' });
    } catch (err) {
      return res.status(500).json({ errorCode: 'database-error', message: err.message });
    }
  }
}

const propertyController = new PropertyController();

module.exports = { propertyController };
