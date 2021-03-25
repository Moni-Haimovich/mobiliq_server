const mongoose = require("mongoose");

const Property = require("../models/Property");
const { ErrorHandler } = require("../libs/error");
const { uploadS3, removeImg } = require("../libs/s3");
const multipleUpload = uploadS3.array("images");

class PropertyController {
  async create(req, res, next) {
    multipleUpload(req, res, async (err) => {
      if (err) {
        return next(new ErrorHandler(500, err.message));
      }

      const imgFiles = req.files.map(({ location }) => location);
      const { name, description, address, lat, lng, images_meta } = req.body;

      if (!name) {
        return next(new ErrorHandler(404, "name can't be blank"));
      }

      if (!description) {
        return next(new ErrorHandler(404, "description can't be blank"));
      }

      if (!address) {
        return next(new ErrorHandler(404, "address can't be blank"));
      }

      if (!lat) {
        return next(new ErrorHandler(404, "lat can't be blank"));
      }

      if (!lng) {
        return next(new ErrorHandler(404, "lng can't be blank"));
      }

      if (isNaN(lat)) {
        return next(new ErrorHandler(400, "lat should be number"));
      }

      if (isNaN(lng)) {
        return next(new ErrorHandler(400, "lng should be number"));
      }

      if (!images_meta) {
        return next(new ErrorHandler(400, "images_meta can't be blank"));
      }

      if (imgFiles.length !== images_meta.length) {
        return next(new ErrorHandler(400, "images_meta length should be same images length"));
      }

      try {
        const images = imgFiles.map((img, index) => ({ url: img, ...images_meta[index] }));
        const property = await Property.create({ name, description, address, lat, lng, images });
        return res.status(200).json({ property });
      } catch (dbError) {
        return next(new ErrorHandler(500, dbError.message));
      }
    });
  }

  async get(req, res, next) {
    try {
      const properties = await Property.find();
      return res.status(200).json({ properties });
    } catch (err) {
      return next(new ErrorHandler(500, err.message));
    }
  }

  async findByName(req, res, next) {
    const { name } = req.query;

    try {
      const properties = await Property.find({ name: { $regex: name, $options: "i" } });
      return res.status(200).json({ properties });
    } catch (err) {
      return next(new ErrorHandler(500, err.message));
    }
  }

  async addImages(req, res, next) {
    multipleUpload(req, res, async (err) => {
      if (err) {
        return next(new ErrorHandler(500, err.message));
      }

      const imgFiles = req.files.map(({ location }) => location);
      const { _id, images_meta } = req.body;

      if (!_id) {
        return next(new ErrorHandler(400, "_id can't be blank"));
      }

      if (!images_meta) {
        return next(new ErrorHandler(400, "images_meta can't be blank"));
      }

      if (imgFiles.length !== images_meta.length) {
        return next(new ErrorHandler(400, "images_meta length should be same images length"));
      }

      try {
        const property = await Property.findById(_id);
        if (!property) {
          return next(new ErrorHandler(404, "property doesn't exist"));
        }

        const { images } = property.toJSON();
        const newImages = imgFiles.map((img, index) => ({
          url: img,
          description: images_meta[index]["description"],
          size: images_meta[index]["size"],
        }));

        await Property.findByIdAndUpdate({ _id }, { images: [...images, ...newImages] });
        res.status(200).json({ message: "images added successfully" });
      } catch (dbError) {
        return next(new ErrorHandler(500, dbError.message));
      }
    });
  }

  async removeImage(req, res, next) {
    const { propertyId, imageId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return next(new ErrorHandler(422, "property id should be ObjectID"));
    }

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return next(new ErrorHandler(422, "image id should be ObjectID"));
    }

    try {
      const property = await Property.findById({ _id: propertyId });

      if (!property) {
        return next(new ErrorHandler(404, "property doesn't exist"));
      }

      const targetImg = property.images.find(({ _id }) => _id.toString() === imageId);

      if (!targetImg) {
        return next(new ErrorHandler(404, "image doesn't exist"));
      }

      // remove image from s3 bucket
      await removeImg(targetImg.url);

      const images = property.images
        .filter(({ _id }) => _id.toString() !== imageId)
        .map(({ url, description, size }) => ({ url, description, size }));
      await Property.findByIdAndUpdate({ _id: propertyId }, { images });

      return res.status(200).json({ message: "image deleted." });
    } catch (err) {
      return next(new ErrorHandler(500, err.message));
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(422, "id should be ObjectID"));
    }

    try {
      const property = await Property.findById({ _id: id });

      if (!property) {
        return next(new ErrorHandler(404, "property doesn't exist"));
      }

      await Property.findByIdAndDelete({ _id: id });
      return res.status(200).json({ message: "property deleted" });
    } catch (err) {
      return next(new ErrorHandler(500, err.message));
    }
  }
}

const propertyController = new PropertyController();

module.exports = { propertyController };
