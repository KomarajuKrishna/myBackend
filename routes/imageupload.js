const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const multer = require('multer');
const Register = require('../schema/registerSchema');

AWS.config.update({
    accessKeyId: "AKIATNZP2XQIMJQLLK5V",
    secretAccessKey: "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",
    region: "ap-south-1",
});

const s3 = new AWS.S3();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file was uploaded.' });
//         }

//         const file = req.file;

//         const bucketName = 'vipmero-one';
//         const timestamp = Date.now();
//         const key = `images/${timestamp}-${file.originalname}`;

//         console.log('Uploading to S3:', key);

//         const params = {
//             Bucket: bucketName,
//             Key: key,
//             Body: file.buffer,
//         };

//         const s3UploadResponse = await s3.upload(params).promise();
//         const fileLocation = s3UploadResponse.Location;

//         console.log('S3 Upload Response:', s3UploadResponse);

//         const imagePath = new Register({
//             profileImage: fileLocation,
//         });

//         const savedImage = await imagePath.save();

//         console.log('Image saved in MongoDB:', savedImage);

//         res.status(200).json({
//             message: 'Image uploaded successfully in MongoDB and S3',
//             location: savedImage.profileImage,
//         });
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         res.status(500).json({ error: 'Error uploading image.' });
//     }
// });

router.post('/upload/:userId', upload.single('image'), async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!req.file) {
            return res.status(400).json({ error: 'No file was uploaded.' });
        }

        const file = req.file;

        const bucketName = 'vipmero-one';
        const timestamp = Date.now();
        const key = `images/${timestamp}-${file.originalname}`;

        console.log('Uploading to S3:', key);

        const params = {
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
        };

        const s3UploadResponse = await s3.upload(params).promise();
        const fileLocation = s3UploadResponse.Location;

        console.log('S3 Upload Response:', s3UploadResponse);

        // Update the user's profileImage field
        const updatedUser = await Register.findOneAndUpdate(
            { _id: userId },
            { $set: { profileImage: fileLocation } },
            { new: true }
        );

        console.log('User profileImage updated:', updatedUser);

        res.status(200).json({
            message: 'Image uploaded successfully in MongoDB and S3',
            location: updatedUser.profileImage,
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Error uploading image.' });
    }
});

module.exports = router;
