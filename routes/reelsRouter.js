// const express = require('express');
// const multer = require('multer');
// const AWS = require('aws-sdk');
// const router = express.Router();

// // AWS S3 Configuration
// const s3 = new AWS.S3({
//   // Configure AWS credentials here
//   accessKeyId: 'AKIATNZP2XQIMJQLLK5V',
//   secretAccessKey: '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',
//   region: 'Asia Pacific (Mumbai) ap-south-1',
// });

// // Multer Configuration
// const upload = multer(); // Configure multer as per your requirements

// // Route for uploading files to S3
// router.post('/reels', upload.single('recode'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   const file = req.file;

//   const params = {
//     Bucket: 'vipmero-one',
//     Key: file.originalname,
//     Body: file.buffer,
//     ACL: 'public-read',
//     ContentType: file.mimetype,
//   };

//   // Upload file to S3
//   s3.upload(params, (err, data) => {
//     if (err) {
//       console.error('Error uploading to S3', err);
//       return res.status(500).send('Error uploading to S3.');
//     }

//     console.log('File uploaded to S3 successfully:', data.Location);
//     return res.send('File uploaded to S3.');
//   });
// });

// module.exports = router;

// const express = require('express');
// const multer = require('multer');
// const AWS = require('aws-sdk');
// const router = express.Router();

// // AWS S3 Configuration
// const s3 = new AWS.S3({
//   // Configure AWS credentials here
//   accessKeyId: 'YOUR_ACCESS_KEY_ID',
//   secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
//   region: 'YOUR_AWS_REGION',
// });

// // Multer Configuration
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Route for uploading files to S3
// router.post('/reels', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   const file = req.file;

//   const params = {
//     Bucket: 'vipmero-one',
//     Key: file.originalname,
//     Body: file.buffer,
//     ACL: 'public-read',
//     ContentType: file.mimetype,
//   };

//   // Upload file to S3
//   s3.upload(params, (err, data) => {
//     if (err) {
//       console.error('Error uploading to S3', err);
//       return res.status(500).send('Error uploading to S3.');
//     }

//     console.log('File uploaded to S3 successfully:', data.Location);
//     return res.send('File uploaded to S3.');
//   });
// });

// module.exports = router;


// router.post('/reels', async (req, res) => {
//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//       }
//     const file = req.files.video;
  

//     try {
//         // Upload video to S3
//         const s3 = new AWS.S3({
//             params: {
//                 Bucket: 'vipmero-one',
//                 ACL: 'public-read'
//             }
//         });

//         const uploadParams = {
//             Key: file.name,
//             Body: file.data,
//             ContentType: file.mimetype
//         };

//         const s3UploadResponse = await s3.upload(uploadParams).promise();
//         const videoLocation = s3UploadResponse.Location;

//      console.log(videoLocation)
//         const hashtagsArray = JSON.parse(req.body.hashtags);// Extract hashtag values

//         // Create the VideoReel with the associated hashtags and hashtag values
//         const videoReel = new reelsdetails({
//             videoreel: videoLocation,
//             hashtags: hashtagsArray,
//             mobile:req.body.mobile,
//             profileImage:req.body.profileImage,
         
//             Fullname:req.body.Fullname,
           
//             description:req.body.description,
//             comment:req.body.comment,
//             share:req.body.share,
//             randomNumber:req.body.randomNumber, // Store hashtag values directly
//             // hashtagObjects: hashtags.map(tag => tag._id) // Save ObjectId references
//         });
//         // console.log(hashtags)
//         // Use a transaction to ensure data consistency
//         const session = await mongoose.startSession();
//         session.startTransaction();

//         try {
//             await videoReel.save({ session });
//             await session.commitTransaction();
//             session.endSession();

//             res.json({ message: 'Video reel information saved successfully' });
//         } catch (error) {
//             await session.abortTransaction();
//             session.endSession();

//             console.error('Error saving video reel:', error);
//             res.status(500).json({ error: 'Failed to save video reel' });
//         }
//     } catch (error) {
//         console.error('Error uploading video to S3:', error);
//         res.status(500).json({ error: 'Failed to upload video to S3 or save video reel' });
//     }
// });

// const express = require('express');
// const AWS = require('aws-sdk');
// const router = express.Router();
// const reelsdetails = require('../schema/reelsSchema')
// router.post('/reels', async (req, res) => {
//   try {
//     if (!req.files || !req.files.video) {
//       return res.status(400).send('No video file uploaded.');
//     }

//     const file = req.files.video;
//     const s3 = new AWS.S3({
//       params: {
//         Bucket: 'vipmero-one',
//         ACL: 'public-read'
//       }
//     });

//     const uploadParams = {
//       Key: file.name,
//       Body: file.data,
//       ContentType: file.mimetype
//     };

//     const s3UploadResponse = await s3.upload(uploadParams).promise();
//     const videoLocation = s3UploadResponse.Location;

//     console.log('Video uploaded to:', videoLocation);

//     const hashtagsArray = JSON.parse(req.body.hashtags || '[]'); // Ensure default empty array if no hashtags provided

//     const videoReel = new reelsdetails({
//       videoreel: videoLocation,
//       hashtags: hashtagsArray,
//       mobile: req.body.mobile,
//       profileImage: req.body.profileImage,
//       Fullname: req.body.Fullname,
//       description: req.body.description,
//       comment: req.body.comment,
//       share: req.body.share,
//       randomNumber: req.body.randomNumber
//     });

//     await videoReel.save();

//     res.json({ message: 'Video reel information saved successfully' });
//   } catch (error) {
//     console.error('Error uploading video to S3 or saving video reel:', error);
//     res.status(500).json({ error: 'Failed to upload video to S3 or save video reel' });
//   }
// });

// module.exports = router;


// const express = require('express');
// const AWS = require('aws-sdk');
// const multer = require('multer');
// const router = express.Router();
// const reelsdetails = require('../schema/reelsSchema'); // Replace with the correct path

// // Configure multer for handling file uploads
// const upload = multer({ dest: 'uploads/' }); // Change the destination folder as needed

// router.post('/reels', upload.single('video'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send('No video file uploaded.');
//     }

//     const file = req.file;
//     // ... rest of your code for uploading to S3 and saving metadata
//   } catch (error) {
//     console.error('Error handling file upload:', error);
//     res.status(500).json({ error: 'Failed to process file upload' });
//   }
// });

// module.exports = router;




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

// multer for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory instead of disk
const upload = multer({ storage: storage });

router.post('/reels', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No video file uploaded.');
    }

    const file = req.file;

    // Uploading video to S3 without setting ACL
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
    const videoLocation = s3UploadResponse.Location;

    console.log('Video uploaded to:', videoLocation);

    // Creating the VideoReel object with the videoLocation 
    const videoReel = new reelsdetails({
      videoreel: videoLocation,
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

    await videoReel.save();

    res.json({ message: 'Video reel information saved successfully' });
  } catch (error) {
    console.error('Error handling file upload or saving metadata:', error);
    res.status(500).json({ error: 'Failed to process file upload or save metadata' });
  }
});

module.exports = router;
