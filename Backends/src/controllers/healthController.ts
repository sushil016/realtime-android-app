import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkHealth = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Service unhealthy'
    });
  }
};

export const checkServiceHealth = async (req: Request, res: Response) => {
  const service = req.params.service;
  
  try {
    let status = 'ok';
    let message = '';

    switch (service) {
      case 'location':
        // Check location service
        const locationCount = await prisma.locationPin.count();
        message = `Location service running, ${locationCount} pins found`;
        break;

      case 'attendance':
        // Check attendance service
        const attendanceCount = await prisma.attendance.count();
        message = `Attendance service running, ${attendanceCount} records found`;
        break;

      case 'profile':
        // Check profile service
        const userCount = await prisma.user.count();
        message = `Profile service running, ${userCount} users found`;
        break;

      case 'notifications':
        // Check notification service
        const notificationCount = await prisma.notification.count();
        message = `Notification service running, ${notificationCount} notifications found`;
        break;

      default:
        status = 'error';
        message = 'Unknown service';
    }

    res.json({
      status,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`${service} health check error:`, error);
    res.status(500).json({
      status: 'error',
      message: `${service} service unhealthy`
    });
  }
}; 