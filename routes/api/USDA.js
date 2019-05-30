const router = require("express").Router();
const USDAController = require("../../controllers/USDAController");

// Matches with "/api/usda"
router.route("/:id")
    .get(USDAController.retrieveUSDAData);

module.exports = router;