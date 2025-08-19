import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      (process.env.JWT_SECRET as string) || 'dev_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to register user' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      (process.env.JWT_SECRET as string) || 'dev_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to login' });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password'];
    const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    // Hash password if it's being updated
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      (req as any).user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update profile' });
  }
};

// Delete user profile
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete((req as any).user._id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete profile' });
  }
}; 