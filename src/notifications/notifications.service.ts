import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private analyticsService: AnalyticsService
  ) {}

  private mapFrontendTypeToBackend(type: 'security' | 'system' | 'hardware' | 'user'): NotificationType {
    const typeMap = {
      'security': NotificationType.SECURITY,
      'system': NotificationType.SYSTEM,
      'hardware': NotificationType.ALERT,
      'user': NotificationType.UPDATE
    };
    return typeMap[type] || NotificationType.SYSTEM;
  }

  private mapDtoToEntity(dto: CreateNotificationDto): Partial<Notification> {
    return {
      title: dto.title,
      message: dto.description,
      type: this.mapFrontendTypeToBackend(dto.type),
      status: NotificationStatus.UNREAD,
      metadata: {
        details: dto.details || '',
        ...dto.metadata
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const notificationData = this.mapDtoToEntity(createNotificationDto);
      const notification = this.notificationRepository.create(notificationData);
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new BadRequestException('Failed to create notification: ' + error.message);
    }
  }

  async createForUser(userId: string, createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const notificationData = {
        ...this.mapDtoToEntity(createNotificationDto),
        userId
      };
      const notification = this.notificationRepository.create(notificationData);
      const savedNotification = await this.notificationRepository.save(notification);

      // Record analytics event for notification sent
      if (this.analyticsService) {
        await this.analyticsService.recordEvent(
          'notification_sent',
          { count: 1 },
          userId,
          { notificationId: savedNotification.id, title: savedNotification.title }
        );
      }

      return savedNotification;
    } catch (error) {
      console.error('Error creating notification for user:', error);
      throw new BadRequestException('Failed to create notification for user: ' + error.message);
    }
  }

  async createForUsers(userIds: string[], createNotificationDto: CreateNotificationDto): Promise<void> {
    try {
      // Validate user IDs
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new BadRequestException('User IDs must be a non-empty array');
      }

      // Validate notification data
      if (!createNotificationDto) {
        throw new BadRequestException('Notification data is required');
      }

      if (!createNotificationDto.title || typeof createNotificationDto.title !== 'string') {
        throw new BadRequestException('Title is required and must be a string');
      }

      if (!createNotificationDto.description || typeof createNotificationDto.description !== 'string') {
        throw new BadRequestException('Description is required and must be a string');
      }

      // Map frontend type to backend type
      const typeMap = {
        'security': NotificationType.SECURITY,
        'system': NotificationType.SYSTEM,
        'hardware': NotificationType.ALERT,
        'user': NotificationType.UPDATE
      };

      const notificationType = typeMap[createNotificationDto.type] || NotificationType.SYSTEM;

      // Create notifications for each user
      const notifications = userIds.map(userId => ({
        ...this.mapDtoToEntity(createNotificationDto),
        userId
      }));
      const savedNotifications = await this.notificationRepository.save(notifications);

      // Record analytics event for bulk notification sent
      if (this.analyticsService) {
        await this.analyticsService.recordEvent(
          'notification_sent_bulk',
          { count: savedNotifications.length },
          undefined,
          { notificationIds: savedNotifications.map(n => n.id), title: createNotificationDto.title }
        );
      }
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to create bulk notifications. Please check your input data.'
      );
    }
  }

  async findAll(userId: string): Promise<Notification[]> {
    try {
      return await this.notificationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error finding notifications:', error);
      throw new BadRequestException('Failed to find notifications: ' + error.message);
    }
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.findAll(userId);
  }

  async findUnread(userId: string): Promise<Notification[]> {
    try {
      return await this.notificationRepository.find({
        where: { 
          userId,
          status: NotificationStatus.UNREAD 
        },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      console.error('Error finding unread notifications:', error);
      throw new BadRequestException('Failed to find unread notifications: ' + error.message);
    }
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id, userId }
      });

      if (!notification) {
        console.log(`Notification ${id} not found for user ${userId}, cannot mark as read`);
        throw new NotFoundException('Notification not found');
      }

      notification.status = NotificationStatus.READ;
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to mark notification as read: ' + error.message);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository.update(
        { userId, status: NotificationStatus.UNREAD },
        { status: NotificationStatus.READ }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new BadRequestException('Failed to mark all notifications as read: ' + error.message);
    }
  }

  async archive(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id, userId }
      });

      if (!notification) {
        console.log(`Notification ${id} not found for user ${userId}, cannot archive`);
        throw new NotFoundException('Notification not found');
      }

      notification.status = NotificationStatus.ARCHIVED;
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Error archiving notification:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to archive notification: ' + error.message);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const result = await this.notificationRepository.delete({ id, userId });
      // If no rows were affected, the notification doesn't exist
      // But we don't throw an error since the goal (notification not existing) is achieved
      if (result.affected === 0) {
        console.log(`Notification ${id} not found for user ${userId}, considering it already deleted`);
        return; // Return successfully since the notification is effectively "deleted"
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Only throw error for actual database errors, not for missing notifications
      if (error.code && error.code !== '23505') { // Not a constraint violation
        throw new BadRequestException('Failed to delete notification: ' + error.message);
      }
      // For constraint violations or other expected errors, just log and return
      console.log(`Notification ${id} could not be deleted: ${error.message}`);
      return;
    }
  }

  async findAllForAdmin(): Promise<Notification[]> {
    try {
      return await this.notificationRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['user']
      });
    } catch (error) {
      console.error('Error finding all notifications:', error);
      throw new BadRequestException('Failed to find notifications: ' + error.message);
    }
  }
} 