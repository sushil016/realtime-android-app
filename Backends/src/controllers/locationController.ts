import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const pinLocation = async (req: Request, res: Response) => {
  try {
    const { userId, latitude, longitude, radius = 200 } = req.body;

    const locationPin = await prisma.locationPin.create({
      data: {
        userId,
        latitude,
        longitude,
        radius,
      },
    });

    res.json({ success: true, data: locationPin });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to pin location' });
  }
};

export const updateLocationHistory = async (req: Request, res: Response) => {
  try {
    const { locationPinId, timeInside, timeOutside } = req.body;

    const history = await prisma.locationHistory.create({
      data: {
        locationPinId,
        timeInside,
        timeOutside,
      },
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update history' });
  }
};

export const getLocationHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const history = await prisma.locationHistory.findMany({
      where: {
        locationPin: {
          userId: parseInt(userId),
        },
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      include: {
        locationPin: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
}; 