import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const initializeSettings = async () => {
  try {
    const existingSettings = await prisma.settings.findFirst();
    
    if (!existingSettings) {
      await prisma.settings.create({
        data: {
          workStartTime: '09:00', // 9 AM
          workEndTime: '17:00',   // 5 PM
          lateThreshold: 15,      // 15 minutes
          earlyDepartThreshold: 15 // 15 minutes
        }
      });
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
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

    const { workStartTime, workEndTime, lateThreshold, earlyDepartThreshold } = req.body;

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
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findFirst();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
}; 