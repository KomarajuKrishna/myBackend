const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const router = express.Router();
const reelsdetails = require('../schema/reelsSchema');

// AWS SDK credentials
AWS.config.update({
  accessKeyId: 'AKIATNZP2XQIMJQLLK5V',
  secretAccessKey: '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',
  region: 'ap-south-1',
});

// Multer for handling file uploads
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post('/media', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const file = req.file;

    // Determine file type (video or image) based on mimetype
    const isVideo = file.mimetype.includes('video');

    // Uploading media to S3 without setting ACL
    const s3 = new AWS.S3({
      params: {
        Bucket: 'vipmero-one'
      }
    });

    const uploadParams = {
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const s3UploadResponse = await s3.upload(uploadParams).promise();
    const mediaLocation = s3UploadResponse.Location;

    console.log(`${isVideo ? 'Video' : 'Image'} uploaded to:`, mediaLocation);

    // Creating the Media object with the mediaLocation 
    const mediaDetails = new reelsdetails({
      media: mediaLocation,
      type: isVideo ? 'video' : 'image',
      // Other fields from your request body
      // Example:
      // mobile: req.body.mobile,
      // profileImage: req.body.profileImage,
      // Fullname: req.body.Fullname,
      // description: req.body.description,
      // comment: req.body.comment,
      // share: req.body.share,
      // randomNumber: req.body.randomNumber
    });

    await mediaDetails.save();

    res.json({ message: `${isVideo ? 'Video' : 'Image'} information saved successfully` });
  } catch (error) {
    console.error('Error handling file upload or saving metadata:', error);
    res.status(500).json({ error: 'Failed to process file upload or save metadata' });
  }
});

module.exports = router;
