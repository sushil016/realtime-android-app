import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns'; // Import date-fns for formatting

const prisma = new PrismaClient();

// Define the extended Request type with user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string | number;
    // add other user properties as needed
  };
}

export const getActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filter } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    let startDate = new Date();
    
    switch(filter) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default: // day
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // const activities = await prisma.activity.findMany({
    //   where: {
    //     userId: userId,
    //     date: {
    //       gte: startDate
    //     }
    //   },
    //   orderBy: {
    //     date: 'desc'
    //   }
    // });

    // const weeklyStats = {
    //   labels: activities.map((activity: { date: string; percentage: number }) => format(new Date(activity.date), 'MM/dd')),
    //   data: activities.map((activity: { date: string; percentage: number }) => activity.percentage)
    // };

    // return res.status(200).json({
    //   success: true,
    //   activities,
    //   weeklyStats
    // });

  } catch (error) {
    console.error('Get activities error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
}; 