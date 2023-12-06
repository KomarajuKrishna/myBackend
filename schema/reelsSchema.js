const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

 const reelsSchema = new mongoose.Schema({
    RestaurantCode:{type:String},
    restaurantName:{type:String},
    profileImage:{type:String},
    randomNumber:{type:String},
    mobile:{type:String},
      videoreel:{type:String},
      description:{type:String},
      comment:{type:String},
      location:{typel:String},
      share:{type:String},
      Fullname:{type:String},
  
      likes: {
        type: Number,
        default: 0
      },
      likedBy:[{
      type:String,  
      }],
      hashtags:[
        {
          type: String,
          trim: true
        }
      ],
      hashtagObjects: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Hashtag'
      }]
 })
 
const reels = mongoose.model('reelvideos', reelsSchema)
module.exports = reels