import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
  };
}

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can create users' 
      });
    }

    const { userName, email, password, role, department, managerId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        userName,
        email,
        password: hashedPassword,
        role,
        department,
        managerId
      }
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can update settings' 
      });
    }

    const { 
      workStartTime, 
      workEndTime, 
      lateThreshold, 
      earlyDepartThreshold 
    } = req.body;

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        workStartTime,
        workEndTime,
        lateThreshold,
        earlyDepartThreshold
      },
      create: {
        workStartTime,
        workEndTime,
        lateThreshold,
        earlyDepartThreshold
      }
    });

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const users = await prisma.user.findMany({
      where: req.user.role === 'MANAGER' ? {
        managerId: req.user.id
      } : undefined,
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        department: true,
        createdAt: true
      }
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
}; 