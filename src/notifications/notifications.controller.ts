import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Notification } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully', type: Notification })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      return await this.notificationsService.create(createNotificationDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create notification',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all notifications', type: [Notification] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req): Promise<Notification[]> {
    try {
      // If user is admin, return all notifications
      if (req.user.role === UserRole.ADMIN) {
        return await this.notificationsService.findAllForAdmin();
      }
      // Otherwise return only user's notifications
      return await this.notificationsService.findAll(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch notifications',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get all unread notifications for the current user' })
  @ApiResponse({ status: 200, description: 'Returns unread notifications', type: [Notification] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findUnread(@Request() req): Promise<Notification[]> {
    try {
      return await this.notificationsService.findUnread(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch unread notifications',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for specific user' })
  @ApiResponse({ status: 200, description: 'Returns user notifications', type: [Notification] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only view own notifications' })
  async findByUser(
    @Param('userId') userId: string,
    @Request() req
  ): Promise<Notification[]> {
    try {
      // Check if user is admin or requesting their own notifications
      if (req.user.role === UserRole.ADMIN || req.user.id === userId) {
        return await this.notificationsService.findByUser(userId);
      }
      throw new HttpException(
        'You can only view your own notifications',
        HttpStatus.FORBIDDEN
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch user notifications',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: Notification })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Request() req): Promise<Notification> {
    try {
      return await this.notificationsService.markAsRead(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to mark notification as read',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for the current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@Request() req): Promise<void> {
    try {
      await this.notificationsService.markAllAsRead(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to mark all notifications as read',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a notification' })
  @ApiResponse({ status: 200, description: 'Notification archived', type: Notification })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async archive(@Param('id') id: string, @Request() req): Promise<Notification> {
    try {
      return await this.notificationsService.archive(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to archive notification',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted or already non-existent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    try {
      await this.notificationsService.delete(id, req.user.id);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete notification',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }
} 