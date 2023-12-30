const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const multer = require('multer');
const vipeRegister = require('../schema/registerSchema');
const Business = require('../schema/Businessschema');

AWS.config.update({
    accessKeyId: "AKIATNZP2XQIMJQLLK5V",
    secretAccessKey: "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",
    region: "ap-south-1",
});

const s3 = new AWS.S3();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router.post('/multiupload', upload.array('images', 5), async (req, res) => {
//     try {
//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({ error: 'No files were uploaded.' });
//         }

//         const images = [];

//         for (const file of req.files) {
//             const timestamp = Date.now();
//             const key = `images/${timestamp}-${file.originalname}`;

//             console.log('Uploading to S3:', key);

//             const params = {
//                 Bucket: 'vipmero-one',
//                 Key: key,
//                 Body: file.buffer,
//             };

//             const s3UploadResponse = await s3.upload(params).promise();
//             const fileLocation = s3UploadResponse.Location;
//             images.push(fileLocation);
//         }

//         const savedImages = await Business.create({ images: images });

//         console.log('Images saved in MongoDB:', savedImages);

//         res.status(200).json({
//             message: 'Images uploaded successfully in MongoDB and S3',
//             Images: savedImages.images,
//         });
//     } catch (error) {
//         console.error('Error uploading images:', error);
//         res.status(500).json({ error: 'Error uploading images.' });
//     }
// });

router.post('/multiupload', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const mobileNumber = req.body.mobileNumber; // Get mobile number from request

        // Check if mobile number exists in vipeRegister schema
        const userExists = await vipeRegister.findOne({ mobile: mobileNumber });

        if (!userExists) {
            return res.status(400).json({ error: 'Number does not exist.' });
        }

        const images = [];

        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index];
            const timestamp = Date.now();
            const key = `images/${timestamp}-${index + 1}-${file.originalname}`; // Add index to the key

            console.log('Uploading to S3:', key);

            const params = {
                Bucket: 'vipmero-one',
                Key: key,
                Body: file.buffer,
            };

            const s3UploadResponse = await s3.upload(params).promise();
            const fileLocation = s3UploadResponse.Location;

            // Add image object with index to the images array
            images.push({ index: index + 1, url: fileLocation });
        }

        // Update images array in the existing Business document
        const updatedBusiness = await Business.findOneAndUpdate(
            { mobileNumber: mobileNumber },
            { $set: { images: images } },
            { new: true }
        );

        console.log('Images saved in MongoDB:', updatedBusiness);

        res.status(200).json({
            message: 'Images uploaded successfully in MongoDB and S3',
            Images: updatedBusiness.images,
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Error uploading images.' });
    }
});





router.delete('/deleteImage/:businessId/:imageId', async (req, res) => {
    try {
        const { businessId, imageId } = req.params;

        // Find the business by ID
        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({ error: 'Business not found.' });
        }

        // Remove the image by ID from the images array
        business.images = business.images.filter((image) => image._id.toString() !== imageId);

        // Save the updated business document
        const updatedBusiness = await business.save();

        console.log('Image deleted:', updatedBusiness);

        res.status(200).json({
            message: 'Image deleted successfully',
            remainingImages: updatedBusiness.images,
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Error deleting image.' });
    }
});


module.exports = router;
