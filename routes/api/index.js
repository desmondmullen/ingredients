const router = require("express").Router();
const USDARoutes = require("./USDA");

router.use("/usda", USDARoutes);

module.exports = router;