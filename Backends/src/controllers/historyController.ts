import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const getLocationHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { filter = 'day' } = req.query;
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (filter) {
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      default: // day
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    const locationHistory = await prisma.locationHistory.findMany({
      where: {
        locationPin: {
          userId: req.user.id
        },
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        locationPin: {
          select: {
            latitude: true,
            longitude: true,
            radius: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calculate statistics
    const stats = locationHistory.map(history => {
      const totalTime = history.timeInside + history.timeOutside;
      const percentage = totalTime > 0 
        ? Math.round((history.timeInside / totalTime) * 100)
        : 0;

      return {
        id: history.id,
        date: history.date,
        timeInside: history.timeInside,
        timeOutside: history.timeOutside,
        percentage,
        status: history.timeInside > history.timeOutside ? 'IN_ZONE' : 'OUT_ZONE'
      };
    });

    // Calculate weekly stats for chart
    const weeklyStats = {
      labels: locationHistory.map(h => 
        h.date.toLocaleDateString('en-US', { weekday: 'short' })
      ),
      data: locationHistory.map(h => {
        const total = h.timeInside + h.timeOutside;
        return total > 0 ? Math.round((h.timeInside / total) * 100) : 0;
      })
    };

    res.json({
      success: true,
      activities: stats,
      weeklyStats
    });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch location history' 
    });
  }
};

export const getAttendanceHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { startDate, endDate } = req.query;

    const attendance = await prisma.attendance.findMany({
      where: {
        userId: req.user.id,
        checkIn: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      orderBy: {
        checkIn: 'desc'
      }
    });

    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch attendance history' 
    });
  }
};

export const getActivitySummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Get today's location history
    const todayLocation = await prisma.locationHistory.findFirst({
      where: {
        locationPin: {
          userId: req.user.id
        },
        date: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    });

    // Get today's attendance
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId: req.user.id,
        checkIn: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    });

    res.json({
      success: true,
      summary: {
        location: todayLocation ? {
          timeInside: todayLocation.timeInside,
          timeOutside: todayLocation.timeOutside,
          percentage: todayLocation.timeInside + todayLocation.timeOutside > 0
            ? Math.round((todayLocation.timeInside / (todayLocation.timeInside + todayLocation.timeOutside)) * 100)
            : 0
        } : null,
        attendance: todayAttendance ? {
          checkIn: todayAttendance.checkIn,
          checkOut: todayAttendance.checkOut,
          status: todayAttendance.status
        } : null
      }
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch activity summary' 
    });
  }
}; 