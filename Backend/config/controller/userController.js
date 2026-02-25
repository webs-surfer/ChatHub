const bcrypt = require("bcryptjs");
const User = require("../../Models/UserModel");
const generateToken = require("../../config/generateToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please enter all the fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      pic,
      
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({
        message: "Failed to create the user",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid Email or Password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message || "Something went wrong",
        });
    }
}

const allUsers = async (req,res)=>{
    const keyword = req.query.search?{
        $or:[
          {name: {$regex: req.query.search, $options: "i"}},
          {email: {$regex: req.query.search, $options: "i"}},
        ],
    }:{};
    const users = await User.find(keyword).find({_id: {$ne: req.user._id}});
    res.send(users);
}

module.exports = {registerUser, authUser,allUsers};
