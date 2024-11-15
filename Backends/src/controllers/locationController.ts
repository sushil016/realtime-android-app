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

    // Get the user's most recent location pin
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

      const locationHistory = await prisma.locationHistory.upsert({
        where: {
          id: locationPin.id,
          date: today
        },
        create: {
          locationPinId: locationPin.id,
          timeInside: distance <= locationPin.radius ? 60 : 0,
          timeOutside: distance <= locationPin.radius ? 0 : 60,
          date: today
        },
        update: {
          timeInside: distance <= locationPin.radius ? { increment: 60 } : undefined,
          timeOutside: distance > locationPin.radius ? { increment: 60 } : undefined
        }
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update location' 
    });
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
        longitude,
        radius: 200 // default radius in meters
      }
    });

    res.json({ success: true, locationPin });
  } catch (err) {
    console.error('Pin location error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to pin location' 
    });
  }
};

export const getLocationStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the most recent location pin and its history
    const locationPin = await prisma.locationPin.findFirst({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        histories: {
          where: {
            date: {
              gte: today
            }
          }
        }
      }
    });

    if (!locationPin || !locationPin.histories.length) {
      return res.json({
        success: true,
        stats: {
          timeInside: '0h 0m',
          timeOutside: '0h 0m',
          percentage: 0,
          lastUpdated: new Date()
        }
      });
    }

    const history = locationPin.histories[0];
    const timeInsideHours = Math.floor(history.timeInside / 3600);
    const timeInsideMinutes = Math.floor((history.timeInside % 3600) / 60);
    const timeOutsideHours = Math.floor(history.timeOutside / 3600);
    const timeOutsideMinutes = Math.floor((history.timeOutside % 3600) / 60);

    const totalTime = history.timeInside + history.timeOutside;
    const percentage = totalTime > 0 
      ? Math.round((history.timeInside / totalTime) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        timeInside: `${timeInsideHours}h ${timeInsideMinutes}m`,
        timeOutside: `${timeOutsideHours}h ${timeOutsideMinutes}m`,
        percentage,
        lastUpdated: history.date
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get location stats' 
    });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
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