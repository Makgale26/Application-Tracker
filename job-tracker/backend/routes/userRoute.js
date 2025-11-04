const userController = require("./controller/userController");
const express = require("express");
const router = express.Router();

router.post("/register", userController.registerUser);

module.exports = router;
