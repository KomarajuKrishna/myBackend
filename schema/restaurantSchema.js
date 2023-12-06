const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId
const timingsPageSchema = new mongoose.Schema({
   
    _id: mongoose.Schema.Types.ObjectId,
         Day:{
         type:String
        },
      
        open:{
         type:String
        },
        close:{
            type:String
           },   
   });
const restaurantSchema = new mongoose.Schema({

   restaurantType:{type:String},
   restaurantName:{type:String},
   RestaurantCode:{type:String},
   RestaurantNumber:{type:String},
   adminNumber:{type:String},
 //  timings:{type:String},
  // availableDays:{type:String},
   Sizeofentity:{type:String},
   Dollars:{type:String},
   ResPostedDate:{type:String},
   rating:{
    type:String,
    default:"0"
},
   superAdminAccept:{
    type:Boolean,
    default:false
},
clubTypes:{
    type:String
},  
allimages:{type:Array}
,
   Status:{
    type:Boolean,
    default:true
   },
   Tables:{type:String},
   Capacity:{type:String},
  // timings: {type:Array}, 

   restimings:[{

	    _id: mongoose.Schema.Types.ObjectId,
         Day:{
         type:String
        },
      
        open:{
         type:String
        },
        close:{
            type:String
           },  
	}],

location: {
    type:{
        type:String,
       enum :['Point']},
    coordinates: [{ 
        type: Number,
        required: 'You must supply coordinates!'
    }],
},




// location: {
//     type: {
//         type: String,
//         enum: ['Point']
//     },
//     coordinates: [{
//         type: [Number],
//         index: '2dsphere'
// }]
// },



totalAvgRating:{
    type:String,
    default:"0"
},
Bookedtables:{
    type:Number,
    default:0},
superAdminAccept:{
    type:String,
    default:'notAccepted'
},
Query:{
    type:String
},
address:{
    street:{type: String},
    city:{type: String},
    state:{type: String},
    zip:{type: Number},
    country:{type:String}
},
foodtype:[{type:String}],
ein:{
    type:String
},
proof:{
    type:String
}
})


restaurantSchema.index({location:"2dsphere"})
    const restaurant = mongoose.model('restaurant', restaurantSchema)
    
module.exports = restaurant