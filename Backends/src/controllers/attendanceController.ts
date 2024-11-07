import { Request, Response } from 'express';
import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const getAttendanceHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { month, year } = req.query;
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const records = await prisma.attendance.findMany({
      where: {
        userId: req.user.id,
        checkIn: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        checkIn: 'desc'
      }
    });

    res.json({
      success: true,
      records: records.map(record => ({
        ...record,
        workHours: record.checkOut 
          ? (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60)
          : null
      }))
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch attendance history' 
    });
  }
};

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: req.user.id,
        checkIn: {
          gte: today
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    // Get work settings
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Work settings not configured'
      });
    }

    // Get or create location pin
    let locationPin = await prisma.locationPin.findFirst({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!locationPin) {
      locationPin = await prisma.locationPin.create({
        data: {
          userId: req.user.id,
          latitude: 0, // Default values
          longitude: 0,
          radius: 200
        }
      });
    }

    // Determine if late
    const now = new Date();
    const [workStartHour, workStartMinute] = settings.workStartTime.split(':');
    const workStart = new Date(now.setHours(
      parseInt(workStartHour),
      parseInt(workStartMinute),
      0,
      0
    ));

    const status = now > new Date(workStart.getTime() + settings.lateThreshold * 60000)
      ? AttendanceStatus.LATE
      : AttendanceStatus.PRESENT;

    // Create attendance record with locationPinId
    const attendance = await prisma.attendance.create({
      data: {
        userId: req.user.id,
        locationPinId: locationPin.id, // Include locationPinId
        checkIn: new Date(),
        status
      }
    });

    // Create notification if late
    if (status === AttendanceStatus.LATE) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Late Arrival',
          message: `You checked in late at ${new Date().toLocaleTimeString()}`,
          type: 'LATE_ARRIVAL'
        }
      });
    }

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check in' 
    });
  }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: req.user.id,
        checkIn: {
          gte: today
        },
        checkOut: null
      }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in found'
      });
    }

    // Get work settings
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Work settings not configured'
      });
    }

    // Check if early departure
    const now = new Date();
    const [workEndHour, workEndMinute] = settings.workEndTime.split(':');
    const workEnd = new Date(now.setHours(
      parseInt(workEndHour),
      parseInt(workEndMinute),
      0,
      0
    ));

    const status = now < new Date(workEnd.getTime() - settings.earlyDepartThreshold * 60000)
      ? AttendanceStatus.EARLY_DEPARTURE
      : attendance.status;

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
        status,
        workHours: (new Date().getTime() - new Date(attendance.checkIn).getTime()) / (1000 * 60 * 60)
      }
    });

    if (status === AttendanceStatus.EARLY_DEPARTURE) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Early Departure',
          message: `You checked out early at ${new Date().toLocaleTimeString()}`,
          type: 'EARLY_DEPARTURE'
        }
      });
    }

    res.json({ success: true, attendance: updatedAttendance });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check out' 
    });
  }
}; 