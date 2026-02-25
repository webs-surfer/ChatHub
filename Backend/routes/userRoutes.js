const express = require("express");
const router = express.Router();
const {registerUser, authUser, allUsers} = require("../config/controller/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.route("/").post(registerUser).get(authMiddleware, allUsers);;
router.post("/login", authUser);
module.exports = router;