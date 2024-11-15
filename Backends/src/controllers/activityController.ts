import { Request, Response } from 'express';
import { PrismaClient, Activity, Attendance } from '@prisma/client';

const prisma = new PrismaClient();

interface ActivityWithAttendance extends Activity {
  attendance: Attendance | null;
}

export const getActivities = async (req: Request, res: Response) => {
  try {
    const { filter = 'day' } = req.query;
    const userId = (req as any).user.id;

    // Get activities with attendance records
    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: getDateFilter(filter as string)
        }
      },
      include: {
        attendance: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate weekly stats
    const weeklyStats = await calculateWeeklyStats(userId);

    res.json({
      success: true,
      activities: activities.map((activity: ActivityWithAttendance) => ({
        id: activity.id,
        date: activity.createdAt,
        timeInside: activity.timeInZone,
        timeOutside: activity.timeOutZone,
        percentage: calculatePercentage(activity.timeInZone, activity.timeOutZone),
        status: activity.isInZone ? 'IN_ZONE' : 'OUT_ZONE',
        attendance: activity.attendance ? {
          checkIn: activity.attendance.checkIn,
          checkOut: activity.attendance.checkOut,
          status: activity.attendance.status
        } : null
      })),
      weeklyStats
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

const getDateFilter = (filter: string): Date => {
  const now = new Date();
  switch (filter) {
    case 'week':
      now.setDate(now.getDate() - 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() - 1);
      break;
    default: // day
      now.setHours(0, 0, 0, 0);
  }
  return now;
};

const calculatePercentage = (timeIn: number, timeOut: number): number => {
  const total = timeIn + timeOut;
  return total === 0 ? 0 : Math.round((timeIn / total) * 100);
};

const calculateWeeklyStats = async (userId: number) => {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const weeklyData = await prisma.activity.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      createdAt: {
        gte: lastWeek
      }
    },
    _sum: {
      timeInZone: true,
      timeOutZone: true
    }
  });

  const labels: string[] = [];
  const data: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayData = weeklyData.find(d => 
      new Date(d.createdAt).toDateString() === date.toDateString()
    );

    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    if (dayData && dayData._sum.timeInZone && dayData._sum.timeOutZone) {
      data.push(calculatePercentage(
        dayData._sum.timeInZone,
        dayData._sum.timeOutZone
      ));
    } else {
      data.push(0);
    }
  }

  return { labels, data };
}; 