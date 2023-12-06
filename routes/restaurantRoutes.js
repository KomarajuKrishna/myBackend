const express = require('express')
const mongoose= require ('mongoose')
// const Restaurant = require('../Models/restaurant');
const Restaurant = require('../schema/registerSchema')
const router = express.Router();   // requiring router
// const UserSignup = require('../Models/register')
const UserSignup = require('../schema/registerSchema')
const OneSignal = require('@onesignal/node-onesignal')
// const geolib = require('geolib');
// const jwtMiddleware =require('../jwtauth')

router.put('/editRestaurant/:id', async (req, res) =>{
    const updates = Object.keys(req.body)   // keys will be stored in updates => req body field names.
    const allowedUpdates = ['restaurantName','RestaurantNumber','timings','availableDays','Sizeofentity','Capacity','Tables','address','city','street','zip','state','Dollars','foodtype']  // updates that are allowed
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // validating the written key in req.body with the allowedUpdates
    if (!isValidOperation) {
        return res.status(400).json({ error: 'invalid updates' })
    }
    try {  // try  catch error is to catch the errors in process
      
        const rest = await Restaurant.findOne({ _id: req.params.id }) // finding the product to be updated
        if (!rest) { //if user is empty it will  throw error as response
            return res.status(404).json({ message: 'Invalid user' })
        }
        UserSignup.find({mobile:'8008008276'}).select().exec().then(
            async doc=>{
          console.log(doc)
          for(let i=0;i<doc.length;i++){
            var uniqId = doc[i].uniqueDeviceId
          }
        updates.forEach((update) => rest[update] = req.body[update]) //updating the value
        await rest.save()
        res.send({rest,
            status:'success'
        })
        if(uniqId != undefined){
            sendnotificationforplacebid( req.body.Username,'Your table booked successfully', uniqId)
        }
     
    })
    
    } catch (error) {
        res.status(400).send(error)
    }
});





router.put('/editResRating/:id', async (req, res) =>{
    const updates = Object.keys(req.body)   // keys will be stored in updates => req body field names.
    const allowedUpdates = ['rating','stars']  // updates that are allowed
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // validating the written key in req.body with the allowedUpdates
    if (!isValidOperation) {
        return res.status(400).json({ error: 'invalid updates' })
    }
    try {  // try  catch error is to catch the errors in process
        const rest = await Restaurant.findOne({ _id: req.params.id }) // finding the product to be updated
        if (!rest) { //if user is empty it will  throw error as response
            return res.status(404).json({ message: 'Invalid user' })
        }
        updates.forEach((update) => rest[update] = req.body[update]) //updating the value
        await rest.save()
        res.send({rest,
            status:'success'
        })
    } catch (error) {
        res.status(400).send(error)
    }
});



router.post('/typeOfRestuarents', (req, res, next) => {
    console.log("generate quotes api is called")
            const quote = new Restaurant({
                _id: new mongoose.Types.ObjectId,
                restaurantType: req.body.restaurantType,
                restaurantName:req.body.restaurantName,
                RestaurantCode:req.body.RestaurantCode,
                image:req.body.image,
                adminNumber:req.body.adminNumber,
                Sizeofentity:req.body.Sizeofentity,
                RestaurantNumber:req.body.RestaurantNumber,
                timings:req.body.timings,
                availableDays:req.body.availableDays,
                ResPostedDate:req.body.ResPostedDate,
                Capacity:req.body.Capacity,
                Status:req.body.Status,
                Tables:req.body.Tables,
                Dollars:req.body.Dollars,
                foodtype:req.body.foodtype,
                // location: {
                //     coordinates:req.body.longLat   //    //longitude , lattitude
                // },
                location: req.body.location,
                address: {
                    street:req.body.street,
                    city:req.body.city,
                    state:req.body.state,
                    zip:req.body.zip,
                        country:req.body.country
                }               
            });

                UserSignup.find({mobile:Number(req.body.adminmobile)}).select().exec().then(
                doc=>{
                console.log(doc)
                for(let i=0;i<doc.length;i++){
                var adminuniqId = doc[i].uniqueDeviceId
                }

            quote.save().then(result => {
                console.log(result);  
                if(adminuniqId != undefined){
                    sendnotificationforadmin( req.body.Name,req.body.adminmess, adminuniqId)
                }            
            
                res.status(200).json(                       
                {                        
                    message: "added succeesfully",
                    status: "success",
                    Id: result._id
                });

            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err,
                    status: "failed",
                    message: "failed to add"
                });
            })    
        
        });
});



    router.get('/getallrestaurants', async (req,res) =>{ 
        try{   
            
            const restaurants = await Restaurant.find()  // async makes a function return a Promise

            res.status(200).json({
            
                Stores : restaurants.length,   // length of the products in schema
                restaurants:restaurants
            })
        }catch (error) {
            res.status(400).send(error)
        } 
        })

 


    
    

    router.get('/restaurant', async (req,res) =>{ 
        try{   
            
            const restaurants = await Restaurant.find()  // async makes a function return a Promise

      var clubs =restaurants.filter((data)=>{
        return (data.restaurantType == "NightLife" && data.superAdminAccept =="Accepted")
      })
      var nightlifes =restaurants.filter((data)=>{
        return (data.restaurantType == "DayParties"&& data.superAdminAccept =="Accepted")
      })
      var restuarents =restaurants.filter((data)=>{
        return (data.restaurantType == "Restaurants"&& data.superAdminAccept =="Accepted")
      })
            res.status(200).json({
                clubs:clubs,
                nightlifes:nightlifes,
                restaurants:restuarents,
                Stores : restaurants.length, 
            })
        }catch (error) {
            res.status(400).send(error)
        } 
        })
    
      
  
    
    
    
        //push reservations to particular restuarent 
    router.post('/restaurants', (req, res, next)=>{
          var query= {"_id":req.body._id,"RestaurantCode":req.body.RestaurantCode} 
           var Rest={$push:{ "allReservations":{
                         "restaurantname":req.body.restaurantname,
                         "Restaurantcode":req.body.Restaurantcode,
                          "Location": req.body.Location, 
                          "restuarentNumber": req.body.restuarentNumber, 
                          "Username":req.body.Username, 
                          "Date":req.body.Date,
                          "Time":req.body.Time,
                          "Quantity":req.body.Quantity,
                          "Text":req.body.Text,
                          "UserNumber":req.body.UserNumber,
                          "ReserveId":req.body.ReserveId
                        }
                        },
                        }
           console.log(Rest)
           console.log(query)
          
    Restaurant.findOneAndUpdate(query,Rest).select().exec().then(
        doc=>{
    
          if(doc){
                    
            res.status(200).json({
                data: doc,
                message:"got the matching loads based on the profile",
                status:"success"
            })
          
        }else{
            res.status(400).json({
                message:"no matching docs found",
                status:"no docs"
            })
    
        }
    
        }
    ).catch(err=>{
        res.status(400).json({
            message:"failed to bid",
            status: "failed",
            error:err
        })
       
        
        }) 
    })

    router.get('/getbyType/:restaurantType',async(req,res)=>{ 
        Restaurant.find({"restaurantType":req.params.restaurantType}).select().exec().then(
            doc => {
                console.log(doc)
                if (doc.length) {
                    res.status(200).json({
                        Loads:doc.length,
                        data: doc,
                        message: "Matching found",
                        status: "success"
                    })
                } else {
                    res.status(400).json({
                        message: "Matching not found",
                        status: "no docs"
                    })
    
                }
            }
        ).catch(err => {
            res.status(400).json({
                message: "failed to get Code",
                status: "failed",
                error: err
            })
        })
    
    })





    
    router.get('/getType/:restaurantType/:superAdminAccept', async(req,res)=>{ 
        Restaurant.find({"restaurantType":req.params.restaurantType,"superAdminAccept":req.params.superAdminAccept}).select().exec().then(
            doc => {
                console.log(doc)
                if (doc.length) {
                    res.status(200).json({
                        Loads:doc.length,
                        data: doc,
                        message: "Matching found",
                        status: "success"
                    })
                } else {
                    res.status(400).json({
                        message: "Matching not found",
                        status: "no docs"
                    })
    
                }
            }
        ).catch(err => {
            res.status(400).json({
                message: "failed to get Code",
                status: "failed",
                error: err
            })
        })
    
    })


    router.get('/getbyNumberRestuarents/:adminNumber', async(req,res)=>{ 
        Restaurant.find({adminNumber:req.params.adminNumber}).select().exec().then(
            doc => {
                console.log(doc)
                if (doc) {
                    res.status(200).json({
                        data: doc,
                        Loads:doc.length,
                       
                        message: "Matching found",
                        status: "success"
                    })
                } else {
                    res.status(400).json({
                        message: "Matching not found",
                        status: "no docs"
                    })
    
                }
            }
        ).catch(err => {
            res.status(400).json({
                message: "failed to get Code",
                status: "failed",
                error: err
            })
        })
    
    })



    //get all reservations based on the Restuarent Code
    router.post('/getReserByRestuarentCode', (req, res, next)=>{
          var query= {"RestaurantCode":req.body.RestaurantCode}  

          Restaurant.find(query).select().exec().then(
             doc=>{
               
        
                 if(doc){
        
                 res.status(200).json({
                    Restuarent: doc,
                     message:"got the matching Reservations based on the profile",
                     status:"success"
                 })
               
               
             }else{
                 res.status(400).json({
                     message:"no matching Resevations found",
                     status:"no docs"
                 })
     
             }

             }
         ).catch(err=>{
             res.status(400).json({
                 message:"no Reservations found found",
                 status: "failed",
                 error:err
             })
         })
        }) 



        //get all reservations for single user
router.post('/getAllReserForUser', (req, res, next) => {
    var query ={"allReservations.$.UserNumber":req.body.UserNumber}
    Restaurant.find(query).select().exec().then(
        doc => {
            console.log(doc)
         
            if (doc.length) {
                res.status(200).json({
                    Loads:doc.length,
                    data: doc,
                    message: "got the matching loads based on the profile",
                    status: "success"
                })
            } else {
                res.status(400).json({
                    message: "no matching loads found",
                    status: "no docs"
                })

            }
        }
    ).catch(err => {
        res.status(400).json({
            message: "failed to get loads",
            status: "failed",
            error: err
        })
    })
})

  //get  Reservations based on the UserNumber
    router.post('/getReserByUserName', (req, res, next)=>{
        var query= {"RestaurantCode":req.body.RestaurantCode}  

        Restaurant.find(query).select().exec().then(
           doc=>{
               for(let i=0;i<doc.length;i++){ 
                  var allRes = doc[i].allReservations
                  //console.log(allRes)
               }
               
         var userReser =allRes.filter(data=>{
            return data.UserNumber == req.body.UserNumber
         })
         console.log(userReser)
               if(userReser){
      
               res.status(200).json({
                  UserReservations: userReser,
                   message:"got the matching Reservations based on the profile",
                   status:"success"
               })
             
             
           }else{
               res.status(400).json({
                   message:"no matching Resevations found",
                   status:"no docs"
               })
   
           }
           
        

           }
       ).catch(err=>{
           res.status(400).json({
               message:"no Reservations found found",
               status: "failed",
               error:err
           })
       })
      }) 
      



//add reviews to particular restuarent
    router.post('/addReviews', (req, res, next)=>{
    
        
        //     console.log(new Date().getTime());
          var query= {"_id":req.body._id,"RestaurantCode":req.body.RestaurantCode}  //quote id and truker mobile no  always Agent mobile NO
       
    
           //newUpdate query for bids
           var Rest={$push:{ "allReviews":{
                         "review":req.body.review,
                         "Restaurantcode":req.body.Restaurantcode,
                          "stars": req.body.starrs, 
                          "reviewerName":req.body.reviewerName, 
                          "reviewerNumber":req.body.reviewerNumber,
                          "restaurantName":req.body.restaurantName,
                          "datePosted":req.body.datePosted,
                          "likesCount":req.body.likesCount,
                        }
                        },
                         
                
                        }
    
           console.log(Rest)
           console.log(query)
          
    Restaurant.findOneAndUpdate(query,Rest).select().exec().then(
        doc=>{
    
        
          if(doc){
                    
            res.status(200).json({
                data: doc,
                message:"got the matching reviews based on the profile",
                status:"success"
            })
          
          
        }else{
            res.status(400).json({
                message:"no matching docs found",
                status:"no docs"
            })
    
        }
    
        }
    ).catch(err=>{
        res.status(400).json({
            message:"failed to get reviews",
            status: "failed",
            error:err
        })
       
        
        }) 
    })

    
        //Loads for Specific truck
router.post('/getAllReviewsForUser', (req, res, next) => {
    var query ={"allReviews.$.reviewerNumber":req.body.reviewerNumber}
    Restaurant.find(query).select().exec().then(
        doc => {
            console.log(doc)
         
            if (doc.length) {
                res.status(200).json({
                    Loads:doc.length,
                    data: doc,
                    message: "got the matching loads based on the profile",
                    status: "success"
                })
            } else {
                res.status(400).json({
                    message: "no matching loads found",
                    status: "no docs"
                })

            }
        }
    ).catch(err => {
        res.status(400).json({
            message: "failed to get loads",
            status: "failed",
            error: err
        })
    })
})

       //get all reviews based on the Restuarent Code
       router.post('/getReviewsByRestuarentCode', (req, res, next)=>{
        var query= {"RestaurantCode":req.body.RestaurantCode}  

        Restaurant.find(query).select().exec().then(
           doc=>{
               for(let i=0;i<doc.length;i++){
                  var allRes = doc[i].allReviews
                  console.log(allRes)
               }
      
               if(allRes){
      
               res.status(200).json({
                  allReviews: allRes,
                   message:"got the matching Reviews based on the profile",
                   status:"success"
               })
             
             
           }else{
               res.status(400).json({
                   message:"no matching Review found",
                   status:"no docs"
               })
   
           }

           }
       ).catch(err=>{
           res.status(400).json({
               message:"no Reviews found found",
               status: "failed",
               error:err
           })
       })
      }) 



      
  //get  reviews based on the UserNumber
    router.post('/getReviewsByUserNumber', (req, res, next)=>{
        var query= {"RestaurantCode":req.body.RestaurantCode}  

        Restaurant.find(query).select().exec().then(
           doc=>{
               for(let i=0;i<doc.length;i++){ 
                  var allRes = doc[i].allReviews
                  //console.log(allRes)
               }
               
         var userReser =allRes.filter(data=>{
            return data.reviewerNumber == req.body.reviewerNumber
         })
         console.log(userReser)
               if(userReser){
      
               res.status(200).json({
                  UserReviews: userReser,
                   message:"got the matching Reviews based on the profile",
                   status:"success"
               })
             
             
           }else{
               res.status(400).json({
                   message:"no matching Reviews found",
                   status:"no docs"
               })
   
           }
           
        

           }
       ).catch(err=>{
           res.status(400).json({
               message:"no Reviews found found",
               status: "failed",
               error:err
           })
       })
      }) 




      //get all reviews
    router.get('/getallReviews', async(req,res)=>{ 
        Restaurant.find({}).select().exec().then(
            doc => {
                console.log(doc)
                for(let i=0;i<doc.length;i++){ 
                    var allRes = doc[i].allReviews
                    //console.log(allRes)
                 }
                if (allRes) {
                    res.status(200).json({
                        Reviews:doc.length,
                        data: allRes,
                        message: "Reviews found",
                        status: "success"
                    })
                } else {
                    res.status(400).json({
                        message: "Matching not found",
                        status: "no docs"
                    })
    
                }
            }
        ).catch(err => {
            res.status(400).json({
                message: "failed to get Reviews",
                status: "failed",
                error: err
            })
        })
    
    })
    
    const theEarth = (function() {
        console.log('theEarth');
        const earthRadius = 6371; // km, miles is 3959
    
        const getDistanceFromRads = function(rads) {
          return parseFloat(rads * earthRadius);
        };
    
        const getRadsFromDistance = function(distance) {
          return parseFloat(distance / earthRadius);
        };
    
        return {
          getDistanceFromRads: getDistanceFromRads,
          getRadsFromDistance: getRadsFromDistance
        };
      })();

    //get  new CLUBS is needed here , integrate this get clubs in app
// router.post('/getClubsNearMe/:maxDistance', (req, res, next)=>{
//     // this is find by the cordinates
//     //{location:{ $near: { $maxDistance:100000,$geometry: { type: "Point",coordinates:[-96.78942678126828,32.78610848088038]}}}}
//     const long = req.body.long
//     const lat =req.body.lat
//     Restaurant.aggregate([
//         //Restaurant.location.createIndex({location:"2dsphere"}),
//         {
            

//                 $geoNear:
//                {

//                 near: { type: "Point",  coordinates:[parseFloat(long),parseFloat(lat)] },
//                 //$minDistance: req.body.minDistance,
//                 key:"location",
//                 $maxDistance: parseFloat(req.params.maxDistance), //parseFloat(1000)*1609,
//                 distanceField:"dist.calculated",
//                 spherical:true

                 
              
//                },
            
           



//         }]
//      ).then(result=>{
//         console.log(result)
//         res.status(200).json({
//             message:"success",
//             data: result
//         })
//      })         

// })

// router.post('/getClubsNearMe', (req, res, next) => {

//     const long = req.body.long
//     const lat =req.body.lat
//     const options = {
//         location: {
//             $geoWithin: {
//                 $centerSphere: [[parseFloat(long),parseFloat(lat)], 15 / 3963.2],
//                 $maxDistance: parseFloat(req.body.maxDistance)
//             }
//         }
//     }
//     Restaurant.find(options).then(data => {
//         res.send(data);
//     })
// })




router.get('/getClubsNearMe', (req, res, next)=>{
    // const long = req.body.long
    // const lat =req.body.lat
    const { lat, long, maxDistance } = req.query;
    // this is find by the cordinates
    Restaurant.find(
        {
        //   location:
        //     { $near:
        //        {
        //          $geometry: { type: "Point",  coordinates: [long,lat] },
        //          //$minDistance: req.body.minDistance,
        //          $maxDistance: req.body.maxDistance
        //        }
        //     }

            location: {
                $near: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(long), parseFloat(lat)],
                  },
                  $maxDistance: parseInt(maxDistance) *1000,
                },
              },
        }
     ).then(result=>{
        console.log(result)

        if(result){
            res.status(200).json({
                message:"success",
                data: result
            })
        }else{
            res.status(400).json({
                message:"failed",
        
            })
        }
      
     })
     

          

})


router.post('/SuperAdminReject', async (req,res,next)=>{

    //var query={"_id":req.body._id };
    var query= {"_id":req.body._id}
    var update ={$set:{"superAdminAccept":req.body.superAdminAccept,"Query":req.body.Query}}
    console.log(update)
    UserSignup.find({mobile:Number(req.body.mobile)}).select().exec().then(
        doc=>{
      console.log(doc)
      for(let i=0;i<doc.length;i++){
        var uniqId =doc[i].uniqueDeviceId
      }
  
    Restaurant.findOneAndUpdate(query,update).select().exec().then(
        doc=>{
           
            console.log(doc)
            res.status(200).json({
                message:doc,
                status:"success"
            })
            if(uniqId!= undefined){
                sendnotificationforplacebid( req.body.Name,req.body.mess, uniqId)
            }
       
        })
    })
    })

//final aaccept by agent
router.post('/SuperAdminAccept', async (req,res,next)=>{

    //var query={"_id":req.body._id };
    var query= {"_id":req.body._id}
    var update ={$set:{"superAdminAccept":req.body.superAdminAccept}}
    console.log(update)
    UserSignup.find({mobile:Number(req.body.mobile)}).select().exec().then(
        doc=>{
      console.log(doc)
      for(let i=0;i<doc.length;i++){
        var uniqId =doc[i].uniqueDeviceId
      }
  
   
    Restaurant.findOneAndUpdate(query,update).select().exec().then(
        doc=>{
           
          if(doc){
            console.log(doc)
            res.status(200).json({
                message:doc,
                status:"success"
            })
          }else{
            console.log(doc)
            res.status(200).json({
                message:'Failed to update',
                status:"failed"
            })
          }
           if(uniqId != undefined){
            sendnotificationforplacebid( req.body.Name,req.body.mess, uniqId)
           }
        })
    })
    })





    router.post('/edittimings', async (req,res,next)=>{

        //var query={"_id":req.body._id };
        var query= {"_id":req.body.docId ,"restimings.Day":req.body.objId}
        var update ={$set:{"restimings.$.open":req.body.open,"restimings.$.close":req.body.close,"multi": true}}
        console.log(update)
      
      
       
        Restaurant.findOneAndUpdate(query,update).select().exec().then(
            doc=>{
               
              if(doc){
                console.log(doc)
                res.status(200).json({
                    message:doc,
                    status:"success"
                })
              }else{
                console.log(doc)
                res.status(200).json({
                    message:'Failed to update',
                    status:"failed"
                })
              }
                //sendnotificationforplacebid( req.body.Name,req.body.mess, uniqId)
            })
        })
    

    router.get('/getbysuperAdminAccept/:superAdminAccept', async(req,res)=>{ 
        Restaurant.find({"superAdminAccept":req.params.superAdminAccept}).select().exec().then(
            doc => {
                console.log(doc)
                if (doc.length) {
                    res.status(200).json({
                        Loads:doc.length,
                        data: doc,
                        message: "Matching found",
                        status: "success"
                    })
                } else {
                    res.status(400).json({
                        message: "Matching not found",
                        status: "failed"
                    })
    
                }
            }
        ).catch(err => {
            res.status(400).json({
                message: "failed to get Code",
                status: "error",
                error: err
            })
        })
    
    })
    // router.get("/search/:key",async (req,resp)=>{
    //     let restaurants = await Restaurant.find(
    //         {
    //             "$or":[
    //                 { restaurantName:{$regex:new RegExp("^"+ req.params.key, "i") } },
    //                 { restaurantType:{$regex:new RegExp("^"+ req.params.key, "i") } },
    //                 // { city:{$regex:new RegExp("^"+ req.params.key, "i") } },
    //                 // { foodtype:{$regex:new RegExp("^"+ req.params.key, "i") } },
    //                 // { "address.city":{$regex:new RegExp("^"+ req.params.key, "i") } },
    //                 // { "address.zip":{$regex:new RegExp("^"+ req.params.key, "i") } },
    //                 // { "address.street":{$regex:new RegExp("^"+ req.params.key, "i") } },
                    
                    
                    
    //             ]
    //         }
    //     )
    //     resp.send(restaurants);
    
    // })

    router.get("/search/:key", async (req, resp) => {
        let restaurants = await Restaurant.find({
          "$or": [
            { restaurantName: { $regex: new RegExp(req.params.key, "i") } },
            { restaurantType: { $regex: new RegExp(req.params.key, "i") } }
            // Add more fields as needed
          ]
        });
        resp.send(restaurants);
      });
      


        //get all reservations based on the Restuarent Code
        router.post('/getRatingscount',jwtMiddleware.verifyToken, (req, res, next)=>{
            var query= {"RestaurantCode":req.body.RestaurantCode}  
  
            Restaurant.find(query).select().exec().then(
               doc=>{
                   for(let i=0;i<doc.length;i++){
                      var allRes = doc[i].allRatings
                      console.log(allRes)
                   }
          
                   if(allRes){
          
                   res.status(200).json({
                      allRatings: allRes,
                       message:"got the matching Reservations based on the profile",
                       status:"success"
                   })
                 
                 
               }else{
                   res.status(400).json({
                       message:"no matching Resevations found",
                       status:"no docs"
                   })
       
               }
  
               }
           ).catch(err=>{
               res.status(400).json({
                   message:"no Reservations found found",
                   status: "failed",
                   error:err
               })
           })
          }) 
          router.put('/updateAvgRate/:RestaurantCode', async (req, res) =>{
            const updates = Object.keys(req.body)   // keys will be stored in updates => req body field names.
            const allowedUpdates = ['totalAvgRating','superAdminAccept','Query']  // updates that are allowed
            const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // validating the written key in req.body with the allowedUpdates
            if (!isValidOperation) {
                return res.status(400).json({ error: 'invalid updates' })
            }
            try {  // try  catch error is to catch the errors in process
                const reg = await Register.findOne({ _id: req.params.id }) // finding the product to be updated
                if (!reg) { //if user is empty it will  throw error as response
                    return res.status(404).json({ message: 'Invalid user' })
                }
                updates.forEach((update) => reg[update] = req.body[update]) //updating the value
        
                await reg.save()
                res.send(reg)
            } catch (error) {
                res.status(400).send(error)
            }
        });

        async function sendnotificationforadmin( Name,mess, uniqId) {
            console.log(uniqId)
           const ONESIGNAL_APP_ID = '74400711-bf20-47f8-9204-ca2f9b677e7f';
         
           const app_key_provider = {
               getToken() {
                   return 'MGRiYjM0Y2YtMmMzYS00YTg3LWFhM2EtODQwODVkOWRkMzc3';
               }
           };
         
           const configuration = OneSignal.createConfiguration({
               authMethods: {
                   app_key: {
                       tokenProvider: app_key_provider
                   }
               }
           });
           const client = new OneSignal.DefaultApi(configuration);
         
           const notification = new OneSignal.Notification();
           notification.app_id = ONESIGNAL_APP_ID;
           //notification.included_segments = ['Subscribed Users'];
           //notification.include_external_user_ids=["8620ac38-96b3-42c7-a52e-e70e4d422790"];
           notification.include_external_user_ids = [uniqId];
           notification.contents = {
               en: Name +" "+mess
           };
           const { id } = await client.createNotification(notification);
         
           const response = await client.getNotification(ONESIGNAL_APP_ID, id);
           console.log(response)
          // res.json(response)
         
         }

        router.post('/updateTablescount', (req,res,next)=>{
            
            var query= {"RestaurantCode":req.body.RestaurantCode}
            var update ={$set:{"Bookedtables":req.body.Bookedtables}}
        
            Restaurant.findOneAndUpdate(query,update).select().exec().then(
                doc=>{
                    console.log(doc)
                    res.status(200).json({
                        message:doc,
                        status:"success"
                    })
                })
            })




            router.get('/calculatedistance/:lat/:lon', (req, res) => {
                const { lat, lon } = req.params; // Get your current location
                
                Restaurant.find().select().exec().then(
                    doc=>{
                     for(let i=0;i<doc.length;i++){
                        var data = doc

                const distances = data.map((restaurant) => ({
                    
                  name: restaurant.RestaurantCode,
                  distance: geolib.getDistance(
                    { latitude: lat, longitude: lon },
                    { latitude: restaurant.latitude, longitude: restaurant.longitude }
                  ),
                }));
            
                res.status(200).json({
                    dist:distances
                });
            }
              });
            
            })
        
        //   router.post('/addRatings', (req, res, next)=>{
        //     //     console.log(new Date().getTime());
        //       var query= {"_id":req.body._id,"RestaurantCode":req.body.RestaurantCode}  //quote id and truker mobile no  always Agent mobile NO
        //        //newUpdate query for bids
        //        var Rest={$push:{ "allRatings":{
        //                      "review":req.body.review,
        //                      "Restaurantcode":req.body.Restaurantcode,
        //                       "stars": req.body.stars, 
        //                       "reviewerName":req.body.reviewerName, 
        //                       "reviewerNumber":req.body.reviewerNumber,
        //                       "restaurantName":req.body.restaurantName,
                           
        //                       "datePosted":req.body.datePosted,
        //                       "likesCount":req.body.likesCount,
        //                     }
        //                     },
        //                     }
        
        //        console.log(Rest)
        //        console.log(query)
              
        // Restaurant.findOneAndUpdate(query,Rest).select().exec().then(
        //     doc=>{
        //       if(doc){
        //         res.status(200).json({
        //             data: doc,
        //             message:"got the matching reviews based on the profile",
        //             status:"success"
        //         })
        //     }else{
        //         res.status(400).json({
        //             message:"no matching docs found",
        //             status:"no docs"
        //         })
        //     }
        
        //     }
        // ).catch(err=>{
        //     res.status(400).json({
        //         message:"failed to get reviews",
        //         status: "failed",
        //         error:err
        //     })
           
            
        //     }) 
        // })


        // router.post('/getRatingsByRestuarentCode', (req, res, next)=>{
        //     var query= {"RestaurantCode":req.body.RestaurantCode}  
    
        //     Restaurant.find(query).select().exec().then(
        //        doc=>{
        //            for(let i=0;i<doc.length;i++){
        //               var allRes = doc[i].allRatings
        //               console.log(allRes)
        //            }
          
        //            if(allRes){
          
        //            res.status(200).json({
        //               allRatings: allRes,
        //                message:"got the matching Ratings based on the profile",
        //                status:"success"
        //            })
                 
                 
        //        }else{
        //            res.status(400).json({
        //                message:"no matching Rating found",
        //                status:"no docs"
        //            })
       
        //        }
    
        //        }
        //    ).catch(err=>{
        //        res.status(400).json({
        //            message:"no Ratings found ",
        //            status: "failed",
        //            error:err
        //        })
        //    })
        //   })


        async function sendnotificationforplacebid( Name,mess, uniqId) {
            console.log(uniqId)
           const ONESIGNAL_APP_ID = '74400711-bf20-47f8-9204-ca2f9b677e7f';
         
           const app_key_provider = {
               getToken() {
                   return 'MGRiYjM0Y2YtMmMzYS00YTg3LWFhM2EtODQwODVkOWRkMzc3';
               }
           };
         
           const configuration = OneSignal.createConfiguration({
               authMethods: {
                   app_key: {
                       tokenProvider: app_key_provider
                   }
               }
           });
           const client = new OneSignal.DefaultApi(configuration);
         
           const notification = new OneSignal.Notification();
           notification.app_id = ONESIGNAL_APP_ID;
           //notification.included_segments = ['Subscribed Users'];
           //notification.include_external_user_ids=["8620ac38-96b3-42c7-a52e-e70e4d422790"];
           notification.include_external_user_ids = [uniqId];
           notification.contents = {
               en: Name +" "+mess
           };
           const { id } = await client.createNotification(notification);
         
           const response = await client.getNotification(ONESIGNAL_APP_ID, id);
           console.log(response)
          // res.json(response)
         
         }

router.post('/statusavailable', (req,res,next)=>{

            var query= {"_id":req.body._id}
            var update ={$set:{"Status":req.body.Status}}
            console.log(update)
          
            Restaurant.findOneAndUpdate(query,update).select().exec().then(
                doc=>{
                   
                    console.log(doc)
                    res.status(200).json({
                        message:doc,
                        status:"success"
                    })
               
                })
})




            router.post('/update-slots/:restaurantId', async (req, res) => {
                try {
                  const { restaurantId } = req.params;
                  const { slots } = req.body;
              
                  // Find the restaurant by ID
                  const restaurant = await Restaurant.findById(restaurantId);
              
                  if (!restaurant) {
                    return res.status(404).json({ message: 'Restaurant not found' });
                  }
              
                  // Update the slots for each day in the openingHours array
                  restaurant.restimings.forEach(day => {
                    const slotData = slots.filter(slot => slot.Day === day.Day);
                    console.log(slotData)
                   // if (slotData) {
                      day.slots = slotData[0].slots;
                    //}
                    console.log(day.slots)
                  });
              
                  // Save the updated restaurant data to MongoDB
                  await restaurant.save();
              
                  return res.status(200).json({ message: 'Slots updated successfully',data: restaurant });
                } catch (error) {
                  console.error(error);
                  return res.status(500).json({ message: 'Internal server error' });
                }
              });

              router.post('/updatebooketables', (req,res,next)=>{
            
                var query= {"_id":req.body._id}
                var update ={$set:{"Bookedtables":req.body.Bookedtables}}
                // UserSignup.find({mobile:Number(req.body.mobile)}).select().exec().then(
                //     doc=>{
                //   console.log(doc)
                //   for(let i=0;i<doc.length;i++){
                //     var uniqId =doc[i].uniqueDeviceId
                //     var name =doc[i].Fullname
                //   }
            
                Restaurant.findOneAndUpdate(query,update).select().exec().then(
                    doc=>{
    
    
                        if(doc){
                            console.log(doc)
                            res.status(200).json({
                                message:doc,
                                status:"success"
                            })
                            // if(uniqId != undefined){
                            //     sendnotificationforadmin(name,,Admin ${req.body.adminAccept} your table booking,uniqId)
                            // }
                          
                        }else{
                            
                            res.status(400).json({
                                message:'Failed to update',
                                status:"failed"
                            })
                        }
                      
                    })
                })

    module.exports=router