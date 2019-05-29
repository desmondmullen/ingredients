require('dotenv').config();
const axios = require('axios');
const USDA = process.env.USDA;

module.exports = {
    retrieveUSDAData: function (req, res) {
        console.log('button clicked in USDAController.js');
        const theBarcode = req.params.id;
        const theBarcodeQuery = `https://api.nal.usda.gov/ndb/search/?format=json&q=${theBarcode}&ds=Branded%20Food%20Products&sort=n&max=25&offset=0&api_key=${USDA}`
        axios.get(theBarcodeQuery)
            .then(function (response) {
                console.log('controller 3: ' + response.data.list.item[ 0 ].ndbno);
                const theNDBno = response.data.list.item[ 0 ].ndbno;
                const theNDBnoQuery = `https://api.nal.usda.gov/ndb/V2/reports?ndbno=${theNDBno}&type=f&format=json&api_key=${USDA}`;
                axios.get(theNDBnoQuery)
                    .then(function (response) {
                        // handle success
                        console.log('controller 5: ' + response.data);
                        res.json(response.data);
                    })
                    .catch(function (error) {
                        // handle error
                        console.log('controller 6: ' + error);
                    });
            })
            .catch(function (error) {
                // handle error
                console.log('controller 8: ' + error);
                res.json('no result');
            });
    }
};