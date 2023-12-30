const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    businessType: { type: String, required: true },
    priceRange: { type: String, required: true },
    businessName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    ein: { type: String, required: true },
    typeOfFood: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    street: { type: String, required: true },
    entitySize: { type: String, required: true },
    entityCapacity: { type: String, required: true },
    numberOfTables: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    selectedState: { type: String, required: true },
    selectedCity: { type: String, required: true },
    images: [
        {
            index: Number,
            url: String,
        },
    ],
    startdays: { type: String },
    enddays: { type: String },
    opentime: { type: String },
    closetime: { type: String },
});

module.exports = mongoose.model('Business', businessSchema);