const express = require("express");
const AWS = require("aws-sdk");
const multer = require("multer");
const router = express.Router();
const reelsdetails = require("../schema/reelsSchema");
const Redis = require("ioredis");
const redisClient = new Redis();
const jwt = require("jsonwebtoken");

// AWS SDK credentials
AWS.config.update({
  accessKeyId: "AKIATNZP2XQIMJQLLK5V",
  secretAccessKey: "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",
  region: "ap-south-1",
});

// Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const verifyAccessToken = async (request, response, next) => {
  let jwtToken;
  const header = request.headers["authorization"];
  if (header !== undefined) {
    jwtToken = header.split(" ")[1];
    // jwtToken = header;
  }

  if (jwtToken === null) {
    response.status(401);
    response.send("Invalid Access Token");
  } else {
    jwt.verify(jwtToken, "AccessToken", async (error, playLoad) => {
      if (error) {
        response.status(401);
        response.send("Invalid Access Token");
      } else {
        request.user = {
          id: playLoad.userId,
        };
        next();
        console.log(playLoad.userId);
        console.log(playLoad.name);
      }
    });
  }
};

//Uploading  media
router.post(
  "/media",
  upload.single("media"),
  verifyAccessToken,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const file = req.file;

      // Determine file type (video or image) based on mimetype
      const isVideo = file.mimetype.includes("video");

      // Uploading media to S3 without setting ACL
      const s3 = new AWS.S3({
        params: {
          Bucket: "vipmero-one",
        },
      });

      const uploadParams = {
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const s3UploadResponse = await s3.upload(uploadParams).promise();
      const mediaLocation = s3UploadResponse.Location;
      const type = isVideo ? "video" : "image";
      console.log(type);

      console.log(`${isVideo ? "Video" : "Image"} uploaded to:`, mediaLocation);

      // Creating the Media object with the mediaLocation
      const mediaDetails = new reelsdetails({
        media: mediaLocation,
        url: mediaLocation,
        type: isVideo ? "video" : "image",
        mediaType: type,
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

      res.json({
        message: `${
          isVideo ? "Video" : "Image"
        } information saved successfully`,
      });
    } catch (error) {
      console.error("Error handling file upload or saving metadata:", error);
      res
        .status(500)
        .json({ error: "Failed to process file upload or save metadata" });
    }
  }
);

// Get all media
router.get("/media", verifyAccessToken, async (req, res) => {
  try {
    const allMedia = await reelsdetails.find();
    res.json(allMedia);
  } catch (error) {
    console.error("Error retrieving media:", error);
    res.status(500).json({ error: "Failed to retrieve media" });
  }
});

router.put("/media/:id/like", verifyAccessToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const reel = await reelsdetails.findById(id);

    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "Reel not found" });
    }

    // if the user has already liked the post
    const alreadyLiked = reel.likedBy.includes(userId);

    if (alreadyLiked) {
      reel.likes -= 1;
      reel.likedBy = reel.likedBy.filter((user) => user !== userId);
    } else {
      reel.likes += 1;
      reel.likedBy.push(userId);
    }

    await reel.save();

    res.json({
      success: true,
      message: alreadyLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
      likes: reel.likes,
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ success: false, message: "Unable to update likes" });
  }
});

router.put("/media/:id/comment", verifyAccessToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { commentText } = req.body;
    const userId = req.user.id;

    const reel = await reelsdetails.findById(id);

    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "Reel not found" });
    }
    reel.comments.push({ comment: commentText, user: userId });

    await reel.save();

    res.json({
      success: true,
      message: "Comment added successfully",
      comments: reel.comments,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Unable to add comment" });
  }
});

module.exports = router;
