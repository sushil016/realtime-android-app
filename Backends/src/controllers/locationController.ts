import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export const updateLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get the user's active location pin
    const locationPin = await prisma.locationPin.findFirst({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (locationPin) {
      // Calculate if user is in zone
      const distance = calculateDistance(
        { latitude, longitude },
        { latitude: locationPin.latitude, longitude: locationPin.longitude }
      );

      // Get or create today's location history
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let history = await prisma.locationHistory.findFirst({
        where: {
          locationPinId: locationPin.id,
          date: {
            gte: today
          }
        }
      });

      if (!history) {
        history = await prisma.locationHistory.create({
          data: {
            locationPinId: locationPin.id,
            timeInside: 0,
            timeOutside: 0,
            date: today
          }
        });
      }

      // Update time spent (adding 60 seconds = 1 minute)
      if (distance <= locationPin.radius) {
        await prisma.locationHistory.update({
          where: { id: history.id },
          data: { timeInside: history.timeInside + 60 }
        });
      } else {
        await prisma.locationHistory.update({
          where: { id: history.id },
          data: { timeOutside: history.timeOutside + 60 }
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pinLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const locationPin = await prisma.locationPin.create({
      data: {
        userId: req.user.id,
        latitude,
        longitude
      }
    });

    res.json({ success: true, locationPin });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLocationStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const locationHistory = await prisma.locationHistory.findFirst({
      where: {
        locationPin: {
          userId: req.user.id
        },
        date: {
          gte: today
        }
      }
    });

    if (!locationHistory) {
      return res.json({
        success: true,
        stats: {
          timeInZone: 0,
          timeOutZone: 0,
          percentage: 0
        }
      });
    }

    const totalTime = locationHistory.timeInside + locationHistory.timeOutside;
    const percentage = totalTime > 0 
      ? Math.round((locationHistory.timeInside / totalTime) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        timeInZone: locationHistory.timeInside,
        timeOutZone: locationHistory.timeOutside,
        percentage
      }
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWeeklyStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyStats = await prisma.locationHistory.findMany({
      where: {
        locationPin: {
          userId: req.user.id
        },
        date: {
          gte: weekStart
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    const dailyBreakdown = weeklyStats.map(stat => {
      const totalTime = stat.timeInside + stat.timeOutside;
      const percentage = totalTime > 0 
        ? Math.round((stat.timeInside / totalTime) * 100)
        : 0;

      return {
        day: stat.date.toLocaleDateString('en-US', { weekday: 'long' }),
        percentage
      };
    });

    res.json({
      success: true,
      weeklyStats: {
        dailyBreakdown
      }
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(point1: { latitude: number; longitude: number }, 
                         point2: { latitude: number; longitude: number }): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.latitude * Math.PI/180;
  const φ2 = point2.latitude * Math.PI/180;
  const Δφ = (point2.latitude - point1.latitude) * Math.PI/180;
  const Δλ = (point2.longitude - point1.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
} 