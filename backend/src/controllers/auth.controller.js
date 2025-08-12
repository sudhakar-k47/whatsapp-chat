import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
  const { fullName,email,password } = req.body;
  try {
    
    if(!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if(password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({email})

    if(user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });

    if(newUser){
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic
        }
      });
    }
  } catch (error) {
    console.error(error);
    console.log(error , "Error occurred during signup");
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async(req, res) => {
  const { email, password} = req.body;
  try {
    const user = await User.findOne({ email})

    if(!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    generateToken(user._id, res);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error(error);
    console.log(error , "Error occurred during login");
    return res.status(500).json({ message: 'Internal server error' });
    
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge: 0})
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    console.log(error , "Error occurred during logout");
    return res.status(500).json({ message: 'Internal server error' });
    
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if(!profilePic) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    // console.log(uploadResponse, "Upload response from cloudinary");
    
    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic
      }
    });

  } catch (error) {
    console.error(error);
    console.log(error , "Error occurred during profile update");
    return res.status(500).json({ message: 'Internal server error' });
    
  }
}

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
    
  } catch (error) {
    console.error(error);
    console.log(error , "Error occurred during authentication check");
    return res.status(500).json({ message: 'Internal server error' });
    
  }
}