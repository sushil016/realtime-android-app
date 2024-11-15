import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        userName: true,
        email: true,
        department: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      userName,
      email,
      department,
      phoneNumber,
      collegeName,
      organization,
      bio,
      address,
      city,
      country,
      currentPassword,
      newPassword
    } = req.body;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (userName) updateData.userName = userName;
    if (email) updateData.email = email;
    if (department) updateData.department = department;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (collegeName) updateData.collegeName = collegeName;
    if (organization) updateData.organization = organization;
    if (bio) updateData.bio = bio;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (country) updateData.country = country;
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        userName: true,
        email: true,
        department: true,
        phoneNumber: true,
        collegeName: true,
        organization: true,
        bio: true,
        avatar: true,
        address: true,
        city: true,
        country: true,
        role: true,
        createdAt: true
      }
    });

    res.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
}; 