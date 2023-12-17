const express = require('express');
const router = express.Router();
const Business = require('../schema/Businessschema');

router.post('/business', async (req, res) => {
    try {
        const newBusiness = new Business({
            businessType: req.body.businessType,
            priceRange: req.body.priceRange,
            businessName: req.body.businessName,
            mobileNumber: req.body.mobileNumber,
            ein: req.body.ein,
            typeOfFood: req.body.typeOfFood,
            zipCode: req.body.zipCode,
            country: req.body.country,
            street: req.body.street,
            entitySize: req.body.entitySize,
            entityCapacity: req.body.entityCapacity,
            numberOfTables: req.body.numberOfTables,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            selectedState: req.body.selectedState,
            selectedCity: req.body.selectedCity,
        });

        // Check if business with the same mobile number already exists
        const existingBusiness = await Business.findOne({ mobileNumber: req.body.mobileNumber });

        if (existingBusiness === null) {
            // If no business found, create a new business
            const result = await newBusiness.save();

            res.status(200).json({
                message: "Business created successfully",
                status: "success",
                business: result
            });
        } else {
            // Business with the same mobile number already exists
            res.status(400).json({
                message: "Business with the same mobile number already exists",
                status: "failed"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message,
            status: "failed"
        });
    }
});


router.get('/business', async (req, res) => {
    try {
        // Retrieve all businesses from the database
        const businesses = await Business.find(); // This assumes you have a model named "Business"

        res.status(200).json({
            message: "Businesses retrieved successfully",
            status: "success",
            businesses: businesses || [] // Return an empty array if no businesses are found
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message,
            status: "failed"
        });
    }
});




module.exports = router;
