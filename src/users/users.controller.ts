import { Controller, Get, Patch, Param, Body, UseGuards, Post, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto, CreateBulkNotificationDto } from '../notifications/dto/create-notification.dto';
import { Request, UnauthorizedException } from '@nestjs/common';
import { Notification } from '../notifications/entities/notification.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @Request() req): Promise<User> {
    // Allow users to view their own profile or admins to view any profile
    if (req.user.role === UserRole.ADMIN || req.user.id === id) {
      return this.usersService.findOne(id);
    }
    throw new UnauthorizedException('You can only view your own profile');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<User> {
    // Allow users to update their own profile or admins to update any profile
    if (req.user.role === UserRole.ADMIN || req.user.id === id) {
      return this.usersService.update(id, updateUserDto);
    }
    throw new UnauthorizedException('You can only update your own profile');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/notifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send notification to user' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  async sendNotification(
    @Param('id') id: string,
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    return this.notificationsService.createForUser(id, createNotificationDto);
  }

  @Post('notifications/bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send notification to multiple users or all users (Admin only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Notifications sent successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        message: { type: 'string' }
      }
    }
  })
  async sendBulkNotifications(
    @Body() data: CreateBulkNotificationDto,
  ): Promise<{ count: number; message: string }> {
    if (data.all) {
      // Send to all users in the system
      const allUsers = await this.usersService.findAll();
      const allUserIds = allUsers.map(user => user.id);
      
      if (allUserIds.length === 0) {
        return {
          count: 0,
          message: 'No users found in the system'
        };
      }
      
      await this.notificationsService.createForUsers(allUserIds, data.notification);
      return {
        count: allUserIds.length,
        message: `Successfully sent notifications to all ${allUserIds.length} users in the system`
      };
    } else {
      // Send to specific users
      if (!data.userIds || data.userIds.length === 0) {
        throw new HttpException(
          'User IDs array is required when "all" is false',
          HttpStatus.BAD_REQUEST
        );
      }
      
      await this.notificationsService.createForUsers(data.userIds, data.notification);
      return {
        count: data.userIds.length,
        message: `Successfully sent notifications to ${data.userIds.length} users`
      };
    }
  }
} 