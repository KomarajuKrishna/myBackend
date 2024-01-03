const express = require("express");
const router = express.Router();
var cors = require("cors");
const mongoose = require("mongoose");
const Register = require("../schema/registerSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const redisClient = new Redis();
// const nodemailer = require('nodemailer')
// const bodyparser = require('body-parser')
// const Register = require('../Models/register')
// const jwtMiddleware =require('../jwtauth')
// const JWT_SECRET = '798fgu46098jhvug5889uuy';
// const OneSignal = require('@onesignal/node-onesignal')

const DEFAULT_EXPIRATION = 3600;

//login

router.post("/logindetails", async (req, res, next) => {
  try {
    const mobile = req.body.mobile;
    const password = req.body.password;

    if (!mobile || !password) {
      return res.status(400).json({
        message: "Mobile number and password are required.",
      });
    }

    // Check if the user exists
    const user = await Register.findOne({ mobile: mobile })
      .select("+password")
      .exec();

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please register first.",
      });
    }

    // Authenticate the user
    // const passwordMatch = await bcrypt.compare(password, user.password);
    const passwordMatch = password === user.password;
    // console.log(newPassword);
    console.log(passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Authentication failed. Incorrect password.",
      });
    }

    // Generate JWT token
    // const token = jwt.sign(
    //   { userId: user._id, mobile: user.mobile },
    //   "AccessToken",
    //   { expiresIn: "1h" } // Token expiration time
    // );
    const playLoad = {
      userId: user._id,
      name: user.Fullname,
    };
    const jwtToken = jwt.sign(playLoad, "AccessToken");
    // await redisClient.set(
    //   "authorizationToken",
    //   jwtToken,
    //   "EX",
    //   DEFAULT_EXPIRATION
    // );
    res.status(200).json({
      message: "Authentication successful",
      token: jwtToken,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await Register.find();
    res.json(users);
  } catch (error) {
    console.error("Error retrieving media:", error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

// Get User By ID
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Register.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error("Error retrieving media by ID:", error);
    res.status(500).json({ error: "Failed to retrieve media by ID" });
  }
});

//registration
router.post("/Register", async (req, res) => {
  try {
    const newSignup 
    = new Register({
      Fullname: req.body.Fullname,
      Email: req.body.Email,
      mobile: req.body.mobile,
      Role: req.body.Role,
      password: req.body.password,
    });

    // Check if user already exists
    const existingUser = await Register.findOne({ mobile: req.body.mobile });

    if (existingUser === null) {
      // If no user found, create a new user
      const result = await newSignup.save();

      res.status(200).json({
        message: "User signed up successfully",
        status: "success",
        user: result,
      });
    } else {
      // User already exists
      res.status(400).json({
        message: "User already exists",
        status: "failed",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      status: "failed",
    });
  }
});

router.get("/getsignupdetails", async (req, res) => {
  try {
    const sinInfo = await Register.find();
    res.status(200).json({
      count: sinInfo.length,
      RegisterInfo: sinInfo,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ err });
  }
});

router.get("/getbymobile/:mobile", async (req, res) => {
  Register.find({ mobile: req.params.mobile })
    .select()
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc.length) {
        res.status(200).json({
          Loads: doc.length,
          data: doc,
          message: "Matching found",
          status: "success",
        });
      } else {
        res.status(400).json({
          message: "Matching not found",
          status: "no docs",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "failed to get Code",
        status: "failed",
        error: err,
      });
    });
});
// const winston = require('winston');

// // Create a logger
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.simple(),
//   transports: [
//     new winston.transports.Console(),
//     // Add more transports if needed, e.g., file, etc.
//   ],
// });

// router.post('/login', (req, res, next) => {
//     const mobile = req.body.mobile;
//     const password = req.body.password;

//     // Find the user by mobile number
//     Register.findOne({ mobile: mobile }).select().exec().then(async user => {
//         if (!user) {
//             // If user not found
//             return res.status(400).json({
//                 message: 'User not found',
//                 status: 'failed'
//             });
//         }

//         // Compare the provided password with the hashed password stored in the database
//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (passwordMatch) {
//             // If passwords match, generate JWT token
//             const token = jwt.sign({ mobile: user.mobile }, 'yourSecretKey', { expiresIn: '1h' });

//             res.status(200).json({
//                 message: 'Login successful',
//                 status: 'success',
//                 userProfile: {
//                     Id: user._id,
//                     Fullname: user.Fullname,
//                     Email: user.Email,
//                     mobile: user.mobile,
//                     city: user.city,
//                     About: user.About,
//                     gender: user.gender,
//                     country: user.country,
//                     Address: user.Address,
//                     state: user.state,
//                     Role: user.Role,
//                     password: user.password,
//                     percentage: user.percentage,
//                 },
//                 token,
//             });
//         } else {
//             // If passwords do not match
//             res.status(401).json({
//                 message: 'Invalid password',
//                 status: 'failed'
//             });
//         }
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err,
//             status: 'failed'
//         });
//     });
// });

router.post("/getsignup", (req, res, next) => {
  var mobileNo = req.body.mobile;
  console.log(mobileNo);

  Register.findOne({ mobile: mobileNo })
    .select()
    .exec()
    .then((doc) => {
      var user = req.body.mobile;
      if (doc == null || doc == undefined || doc == "") {
        res.status(400).json({
          Authentication: "User not exist",
          message: "failed",
        });
      } else if (user == doc.mobile) {
        console.log(user);
        const token = jwtMiddleware.generateToken(user.mobile);
        logger.info(token);
        const refreshToken = jwtMiddleware.generateRefreshToken(user.mobile);
        logger.info(refreshToken);
        res.status(200).json({
          Authentication: doc._id,
          message: "Success",
          userProfile: doc,
          token,
          refreshToken,
        });
      } else {
        res.status(400).json({
          Authentication: "Failed to login ",
          message: "error",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// router.post('/addsignupdetails', (req, res, next) => {
//     console.log("User profile is called")

//     const signup = new Register({
//         _id: new mongoose.Types.ObjectId,
//         mobile: req.body.mobile,
//         Fullname: req.body.Fullname,
//         Email: req.body.Email,
//         city:req.body.city,
//         About:req.body.About,
//         gender:req.body.gender,
//         uniqueid:req.body.uniqueid,
//         Role:req.body.Role,
//         uniqueDeviceId:req.body.uniqueDeviceId
//     });

//     var mobile = req.body.mobile;
//     var Email = req.body.Email;
//     var uniqueid = req.body.uniqueid;
//     //first check if user is alredy existed
//     Register.findOne({ $or: [{mobile: mobile },{Email:Email} ]}).select().exec().then(doc => {
//         console.log(doc)
//         if (doc == null || doc == undefined || doc == '') { //if no user found then create new user
//             signup.save().then(result => {
//                 // for(let i=0;i<result.length;i++){
//                 //     var uniqId =result[i].uniqueDeviceId
//                 //   }
//                 res.status(200).json({
//                     message: "User signed up susccessfully",
//                     status: "success",
//                     Id: result._id,
//                     Fullname:result.Fullname,
//                     Email: result.Email,
//                     mobile:result.mobile,
//                     city:result.city,
//                     About:result.About,
//                     gender:result.gender,
//                     country:result.country,
//                     Address:result.Address,
//                     state:result.state,
//                     Role:result.Role,
//                     //uniqueid:result.uniqueid
//                 });
//             }).catch(err => {
//                 console.log(err);
//                 res.status(500).json({
//                     error: err,
//                     status: "faileds"
//                 });
//             })
//         } else {
//             res.status(200).json({
//                 message: "user aleredy exists",
//                 status: "failed"
//             })
//         }
//     });
// });

router.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const secretKey = "cgvhbxdfcvgvvgcfvb";
  jwt.verify(refreshToken, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const newAccessToken = jwt.sign({ user: user.user }, secretKey, {
      expiresIn: "30m",
    });

    res.json({ accessToken: newAccessToken });
  });
});

//add signup

router.post("/addsignupdetails", async (req, res, next) => {
  console.log("User profile is called");

  // Fields to consider for percentage calculation
  const totalFields = [
    "mobile",
    "Fullname",
    "Email",
    "city",
    "About",
    "gender",
    "Address",
    "Role",
    "state",
    "country",
  ];

  // Count the number of fields present in the request
  let presentFields = 0;
  for (const field of totalFields) {
    if (req.body[field] !== undefined && req.body[field] !== "") {
      presentFields++;
    }
  }

  const percentage = (presentFields / totalFields.length) * 100;

  if (req.body.password) {
    var hashedPassword = await bcrypt.hash(req.body.password, 10);
  } else {
    var hashedPassword = "";
  }

  const signup = new Register({
    _id: new mongoose.Types.ObjectId(),
    mobile: req.body.mobile,
    Fullname: req.body.Fullname,
    Email: req.body.Email,
    city: req.body.city,
    About: req.body.About,
    gender: req.body.gender,
    uniqueid: req.body.uniqueid,
    Role: req.body.Role,
    uniqueDeviceId: req.body.uniqueDeviceId,
    percentage: percentage,
    password: hashedPassword,
  });

  var mobile = req.body.mobile;
  var Email = req.body.Email;
  var uniqueid = req.body.uniqueid;

  //first check if user is already existed
  Register.findOne({ $or: [{ mobile: mobile }, { Email: Email }] })
    .select()
    .exec()
    .then((doc) => {
      console.log(doc);

      if (!doc) {
        // If no user found, create a new user
        signup
          .save()
          .then((result) => {
            res.status(200).json({
              message: "User signed up successfully",
              status: "success",
              Id: result._id,
              Fullname: result.Fullname,
              Email: result.Email,
              mobile: result.mobile,
              city: result.city,
              About: result.About,
              gender: result.gender,
              country: result.country,
              Address: result.Address,
              state: result.state,
              Role: result.Role,
              password: result.password,
              percentage: result.percentage,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
              status: "failed",
            });
          });
      } else {
        res.status(200).json({
          message: "User already exists",
          status: "failed",
        });
      }
    });
});

router.put("/editProfile/:id", (req, res, next) => {
  const id = req.params.id; // Extract the document ID from the request params

  // Fields to consider for percentage calculation
  const totalFields = [
    "mobile",
    "Fullname",
    "Email",
    "city",
    "About",
    "gender",
    "Address",
    "Role",
    "state",
    "country",
  ];

  // Find the existing document in the MongoDB collection
  Register.findById(id)
    .then((existingDoc) => {
      if (!existingDoc) {
        return res.status(404).json({
          message: "User not found",
          status: "failed",
        });
      }

      // Merge the existing data with the new data from the request body
      const updatedData = { ...existingDoc.toObject(), ...req.body };

      // Count the number of fields present in the merged data
      let presentFields = 0;
      for (const field of totalFields) {
        if (updatedData[field] !== undefined && updatedData[field] !== "") {
          presentFields++;
        }
      }

      const percentage = (presentFields / totalFields.length) * 100;

      // Update the percentage in the merged data
      updatedData.percentage = percentage;

      // Update the document in the MongoDB collection
      Register.findByIdAndUpdate(id, updatedData, { new: true })
        .then((updatedDoc) => {
          if (!updatedDoc) {
            return res.status(404).json({
              message: "User not found",
              status: "failed",
            });
          }

          res.status(200).json({
            message: "User details updated successfully",
            status: "success",
            Id: updatedDoc._id,
            Fullname: updatedDoc.Fullname,
            Email: updatedDoc.Email,
            mobile: updatedDoc.mobile,
            city: updatedDoc.city,
            About: updatedDoc.About,
            gender: updatedDoc.gender,
            country: updatedDoc.country,
            Address: updatedDoc.Address,
            state: updatedDoc.state,
            Role: updatedDoc.Role,
            percentage: updatedDoc.percentage,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
            status: "failed",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
        status: "failed",
      });
    });
});

// router.put('/editProfile/:id', (req, res, next) => {
//     const id = req.params.id; // Extract the document ID from the request params

//     // Fields to consider for percentage calculation
//     const totalFields = ['mobile', 'Fullname', 'Email', 'city', 'About', 'gender', 'Address', 'Role', 'state', 'country', 'password', 'uniqueDeviceId'];

//     // Find the existing document in the MongoDB collection
//     Register.findById(id)
//         .then(existingDoc => {
//             if (!existingDoc) {
//                 return res.status(404).json({
//                     message: "User not found",
//                     status: "failed"
//                 });
//             }

//             // Merge the existing data with the new data from the request body
//             const updatedData = { ...existingDoc.toObject(), ...req.body };

//             // Count the number of fields present in the merged data
//             let presentFields = 0;
//             for (const field of totalFields) {
//                 if (updatedData[field] !== undefined && updatedData[field] !== '') {
//                     presentFields++;
//                 }
//             }

//             const percentage = (presentFields / totalFields.length) * 100;

//             // Update the percentage in the merged data
//             updatedData.percentage = percentage;

//             // Update the document in the MongoDB collection
//             Register.findByIdAndUpdate(id, updatedData, { new: true })
//                 .then(updatedDoc => {
//                     if (!updatedDoc) {
//                         return res.status(404).json({
//                             message: "User not found",
//                             status: "failed"
//                         });
//                     }

//                     res.status(200).json({
//                         message: "User details updated successfully",
//                         status: "success",
//                         Id: updatedDoc._id,
//                         Fullname: updatedDoc.Fullname,

//                         Email: updatedDoc.Email,
//                         mobile: updatedDoc.mobile,
//                         city: updatedDoc.city,
//                         About: updatedDoc.About,
//                         gender: updatedDoc.gender,
//                         country: updatedDoc.country,
//                         Address: updatedDoc.Address,
//                         state: updatedDoc.state,
//                         Role: updatedDoc.Role,
//                         password: updatedDoc.password,
//                         percentage: updatedDoc.percentage,
//                     });
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     res.status(500).json({
//                         error: err,
//                         status: "failed"
//                     });
//                 });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err,
//                 status: "failed"
//             });
//         });
// });

router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await Register.findOne({ mobile });

    if (!user) {
      return res.status(401).json({
        status: "failed",
        error: "User not found",
      });
    }

    async function comparePasswords(enteredPassword, hashedPassword) {
      try {
        const passwordMatch = await bcrypt.compare(
          enteredPassword,
          hashedPassword
        );
        return passwordMatch;
      } catch (error) {
        // Handle any errors that may occur during the comparison
        res.status(401).json({
          status: "invalid",
          error: "Invalid password",
        });
      }
    }

    // Example usage
    const enteredPassword = password; // Replace with the user-entered password
    const hashedPassword = user.password; // Replace with the hashed password from your database

    comparePasswords(enteredPassword, hashedPassword)
      .then((passwordMatch) => {
        console.log(passwordMatch);
        if (passwordMatch) {
          const token = jwtMiddleware.generateToken(user.mobile, user.Role);
          logger.info(token);
          const refreshToken = jwtMiddleware.generateRefreshToken(
            user.mobile,
            user.Role
          );
          logger.info(refreshToken);
          res.json({
            status: "success",
            user,
            token,
            refreshToken,
          });
        } else {
          res.status(401).json({
            status: "invalid",
            error: "Invalid password",
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });

    //   const passwordMatch =  bcrypt.compare(password, user.password);

    //   if (!passwordMatch) {
    //     return res.status(401).json({
    //         status:"invalid",
    //         error: 'Invalid password' });
    //   }

    //   const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    //     expiresIn: '1h',
    //   });

    //   res.json({
    //     status:"success",
    //     user,
    //      token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// router.post('/register', async (req, res) => {
//     try {
//       const { mobile, password,Fullname,Email ,Role} = req.body;
//       const userexist = await Register.findOne({ mobile });

//       if (userexist) {
//         return res.status(401).json({
//             status:'exist',
//              error: 'User exist found' });
//       }
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRounds);

//       const user = new Register({
//         mobile,
//         password: hashedPassword,
//         Fullname,
//         Email,
//         Role
//       });

//       await user.save();
//       res.status(201).json({
//         status:"success",
//          message: 'User registered successfully' });
//     } catch (error) {
//       res.status(500).json({
//         status:"failed",
//         error: 'Internal server error' });
//     }
//   });

router.post("/register", async (req, res) => {
  try {
    const { mobile, Fullname, Email, Role } = req.body;
    const userexist = await Register.findOne({ mobile });

    if (userexist) {
      return res.status(401).json({
        status: "exist",
        error: "User exist found",
      });
    }
    const saltRounds = 10;
    //   const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new Register({
      mobile,
      // password: hashedPassword,
      Fullname,
      Email,
      Role,
    });

    await user.save();
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "Internal server error",
    });
  }
});
router.get("/getSignUpById/:id", async (req, res) => {
  Register.find({ _id: req.params.id })
    .select()
    .exec()
    .then((doc) => {
      console.log(doc);
      for (let i = 0; i < doc.length; i++) {
        var data = doc[i].profileImage;
      }
      if (doc) {
        res.status(200).json({
          profile: data,
          message: "Matching found",
          status: "success",
          doc: doc,
        });
      } else {
        res.status(400).json({
          message: "Matching not found",
          status: "no docs",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "failed to get Code",
        status: "failed",
        error: err,
      });
    });
});

async function sendnotificationforplacebid(mess, Name, BidPrice, uniqId) {
  console.log(uniqId);
  const ONESIGNAL_APP_ID = "74400711-bf20-47f8-9204-ca2f9b677e7f";

  const app_key_provider = {
    getToken() {
      return "MGRiYjM0Y2YtMmMzYS00YTg3LWFhM2EtODQwODVkOWRkMzc3";
    },
  };

  const configuration = OneSignal.createConfiguration({
    authMethods: {
      app_key: {
        tokenProvider: app_key_provider,
      },
    },
  });
  const client = new OneSignal.DefaultApi(configuration);

  const notification = new OneSignal.Notification();
  notification.app_id = ONESIGNAL_APP_ID;
  //notification.included_segments = ['Subscribed Users'];
  //notification.include_external_user_ids=["86744b78-55c9-42a7-92ee-5d93e1434d2b"];
  notification.include_external_user_ids = [uniqId];
  notification.contents = {
    en: "narayan" + " " + "posted",
  };
  const { id } = await client.createNotification(notification);

  const response = await client.getNotification(ONESIGNAL_APP_ID, id);
  console.log(response);
  //res.json(response)
}

async function sendnotificationforplacebid(mess, Name, BidPrice, uniqId) {
  console.log(uniqId);
  const ONESIGNAL_APP_ID = "b565b895-f2bd-4be3-b40f-99a29750c39e";

  const app_key_provider = {
    getToken() {
      return "MDczYjQwZTEtOGQ4Ni00MWMxLTk1ODYtMjEyMWU2ZjZhZTcy";
    },
  };

  const configuration = OneSignal.createConfiguration({
    authMethods: {
      app_key: {
        tokenProvider: app_key_provider,
      },
    },
  });
  const client = new OneSignal.DefaultApi(configuration);

  const notification = new OneSignal.Notification();
  notification.app_id = ONESIGNAL_APP_ID;
  //notification.included_segments = ['Subscribed Users'];
  //notification.include_external_user_ids=["86744b78-55c9-42a7-92ee-5d93e1434d2b"];
  notification.include_external_user_ids = [uniqId];
  notification.contents = {
    en: Name + " " + mess + " " + BidPrice,
  };
  const { id } = await client.createNotification(notification);

  const response = await client.getNotification(ONESIGNAL_APP_ID, id);
  console.log(response);
  //res.json(response)
}

router.post("/followers", (req, res, next) => {
  var query = { _id: req.body._id };

  var Rest = {
    $push: {
      followers: {
        mobile: req.body.mobile,
        Fullname: req.body.Fullname,
        profileImage: req.body.profileImage,

        // "profileImage": req.body.profileImage,
      },
    },
  };

  console.log(Rest);
  console.log(query);

  Register.findOneAndUpdate(query, Rest)
    .select()
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          data: doc,
          message: "got the matching loads based on the profile",
          status: "success",
        });
      } else {
        res.status(400).json({
          message: "no matching docs found",
          status: "no docs",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "failed to bid",
        status: "failed",
        error: err,
      });
    });
});

router.get("/getfollowers/:mobile", async (req, res) => {
  Register.find({ mobile: req.params.mobile })
    .select()
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          data: doc,
          Loads: doc.length,

          message: "Matching found",
          status: "success",
        });
      } else {
        res.status(400).json({
          message: "Matching not found",
          status: "no docs",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "failed to get Code",
        status: "failed",
        error: err,
      });
    });
});

router.get("/getfollowers/:mobile", async (req, res) => {
  Register.find({ mobile: req.params.mobile })
    .select()
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          data: doc,
          Loads: doc.length,

          message: "Matching found",
          status: "success",
        });
      } else {
        res.status(400).json({
          message: "Matching not found",
          status: "no docs",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "failed to get Code",
        status: "failed",
        error: err,
      });
    });
});
// router.post('/deletefollower', jwtMiddleware.verifyToken,async (req, res) => {
//     try {
//       const id = req.body.id; // The document ID
//       const index = req.body.mobile// The index number of the element to delete
//  // console.log(index)
//   console.log(id)
//       // Find the document by ID
// //       const document = await Register.findById(id);

// //       if (!document) {
// //         return res.status(404).json({ message: 'Document not found' });
// //       }
// //   console.log(document)
//       // Check if the index is valid
//     //   if (index >= 0 && index < document.followers.length) {
//     //     // Remove the element from the array
//     //     // document.followers.splice(index, 1);

//     //     // Save the updated document
//     //     await document.save();

//     //     res.json({ message: 'Element deleted successfully' });
//     //   } else {
//     //     res.status(400).json({ message: 'Invalid index number' });
//     //   }

//     Register.updateOne( {_id:id},{ $pull: { followers: { mobile: index } } })  //params means parameter value
//       .then((data) => {

//            // sendnotificationforplacebid( req.body.Name,req.body.mess, uniqId)
//             res.json(data)
//       })
//       .catch(err => res.status(400).json(Error: ${err}));
//   }
//      catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   });

// router.post('/deletefollower', (req, res, next)=>{
//     console.log(req.body._id)
//     console.log(req.body.mobile)
//     Register.findOneAndDelete({ "_id":req.body._id,"followers.$.mobile":req.body.mobile}).select().exec().then(doc=>{
//          console.log(doc);

//         //accessing particular bids of that user truker only bids accessed here

//         if(doc){

//         //console.log(tempData);
//         res.status(200).json({
//             status:"success",
//             message: "found the bids",
//             data:doc,
//             count:doc.length
//         })
//     }else{
//         res.status(400).json({
//             status:"failed",
//             message:"no bids found"
//         })
//     }

//     })
// })
// router.post('/deletefollower', (req, res, next)=>{
//     console.log(req.body._id)
//     console.log(req.body.mobile)
//     Register.findOneAndDelete({ "_id":req.body._id,"followers.$.mobile":req.body.mobile}).select().exec().then(doc=>{
//          console.log(doc);

//         //accessing particular bids of that user truker only bids accessed here

//         if(doc){

//         //console.log(tempData);
//         res.status(200).json({
//             status:"success",
//             message: "found the bids",
//             data:doc,
//             count:doc.length
//         })
//     }else{
//         res.status(400).json({
//             status:"failed",
//             message:"no bids found"
//         })
//     }

//     })
// })

//     router.post('/forgot-password',jwtMiddleware.verifyToken, (req, res) => {
//         const { Email,otp } = req.body;
//        // const otp = Math.floor(100000 + Math.random() * 900000);

//       Register.findOne({Email:Email}).select().exec().then( doc => {

//         if(doc == null || doc == undefined || doc ==''){
//           res.status(400).json({
//               Authentication: 'User not exist',
//               message:'failed'
//           })
//         }

//         else if(Email == doc.Email){

//             var transporter = nodemailer.createTransport({
//                 service: 'Gmail',
//                 auth: {
//                     user: 'vipmetechnologies2023@gmail.com',
//                     pass: 'kkez ysjm trjy nitl'
//                 }
//             });

// const mailOptions = {
//   from: 'vipmetechnologies2023@gmail.com',
//   to: Email,
//   subject: 'Password Reset OTP',
//   text: You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n

//     +  Your One-Time Password (OTP) for password reset is: ${otp}.

// };

// transporter.sendMail(mailOptions, (error) => {
//   if (error) {
//     console.log(error);
//     res.status(500).send('Error sending reset link');
//   } else {
//     res.status(400).json({
//         message: "OTP sent successfully",
//         status: "otpsent",
//         Authentication: doc._id,
//         otp
//     })
//   }
// });

//         }
//         else
//         {
//             res.status(400).json({
//                 Authentication: 'Failed to login ',
//                 message:'error'
//                                 });

//         }
//        }).catch(err => {
//            console.log(err);
//            res.status(500).json({error: err});
//        });

//       });

router.post("/update-password", async (req, res) => {
  const password = req.body.password;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password in MongoDB
    const result = await Register.findOneAndUpdate(
      { _id: req.body.userDocId },
      { password: hashedPassword }
    );

    console.log("Password updated successfully");
    res.status(400).json({
      Authentication: "Password updated successfully",
      message: "success",
      result,
    });
  } catch (error) {
    res.status(400).json({
      Authentication: "Failed to update ",
      message: "error",
    });
  }
});

module.exports = router;
