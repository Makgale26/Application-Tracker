const userController = require("../controller/userController");
const express = require("express");
const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.login);
// Return all users at the router root so mounting paths are cleaner
router.get("/", userController.getAllUser);

module.exports = router;