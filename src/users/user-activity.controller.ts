import { Controller, Get, Post, Body, Query, UseGuards, Param, Request, BadRequestException, NotFoundException, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { UserActivityService } from './user-activity.service';
import { UserActivity, ActivityType } from './entities/user-activity.entity';
import { CreateUserActivityDto } from './dto/create-user-activity.dto';
import { ActivityFilter } from './dto/activity-filter.dto';
import { ValidationPipe } from '@nestjs/common';

@ApiTags('user-activity')
@Controller('user-activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Post()
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true,
    skipMissingProperties: true // Allow missing userId
  }))
  @ApiOperation({ summary: 'Create user activity log' })
  @ApiResponse({ 
    status: 201, 
    description: 'Activity logged successfully',
    type: UserActivity
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid activity data'
  })
  async create(
    @Body() createUserActivityDto: CreateUserActivityDto,
    @Request() req
  ): Promise<UserActivity> {
    try {
      // Set userId from authenticated user if not provided
      if (!createUserActivityDto.userId) {
        if (!req.user) {
          throw new BadRequestException('Authentication required - no user found in request');
        }
        if (!req.user.id) {
          throw new BadRequestException('Authentication required - no user ID found in request');
        }
        createUserActivityDto.userId = req.user.id;
      }

      // Validate that userId is now set and is a valid UUID
      if (!createUserActivityDto.userId) {
        throw new BadRequestException('User ID is required');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(createUserActivityDto.userId)) {
        throw new BadRequestException(`Invalid UUID format: ${createUserActivityDto.userId}`);
      }

      // Validate activity type
      if (!createUserActivityDto.type) {
        throw new BadRequestException('Activity type is required');
      }

      // Validate description
      if (!createUserActivityDto.description) {
        throw new BadRequestException('Activity description is required');
      }

      // Add request metadata if not provided
      if (!createUserActivityDto.metadata) {
        createUserActivityDto.metadata = {};
      }

      // Add IP address if available
      if (!createUserActivityDto.metadata.ipAddress && req.ip) {
        createUserActivityDto.metadata.ipAddress = req.ip;
      }

      // Add user agent if available
      if (!createUserActivityDto.metadata.userAgent && req.headers['user-agent']) {
        createUserActivityDto.metadata.userAgent = req.headers['user-agent'];
      }

      // Add timestamp
      createUserActivityDto.metadata.timestamp = new Date().toISOString();

      return await this.userActivityService.create(createUserActivityDto);
    } catch (error) {
      console.error('Error creating user activity:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to create user activity log'
      );
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all user activities with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated user activities',
    schema: {
      type: 'object',
      properties: {
        activities: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserActivity' }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' }
          }
        }
      }
    }
  })
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: ActivityType,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{
    activities: UserActivity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    // Parse pagination parameters
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 5; // Default to 5 items per page
    
    // Validate pagination parameters
    if (currentPage < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (pageLimit < 1 || pageLimit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const filter: ActivityFilter = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
      userId
    };

    return await this.userActivityService.findAllWithPagination(filter, currentPage, pageLimit);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user activity summary' })
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.userActivityService.getSummary({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activities by user ID with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated user activities',
    schema: {
      type: 'object',
      properties: {
        activities: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserActivity' }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid user ID or unauthorized access'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
  })
  async findByUser(
    @Request() req,
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: ActivityType,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{
    activities: UserActivity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      // Validate user ID
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new BadRequestException(`Invalid UUID format: ${userId}`);
      }

      // Check if user is authorized to view these activities
      const isAdmin = req.user.role === UserRole.ADMIN;
      const isOwnActivity = req.user.id === userId;

      if (!isAdmin && !isOwnActivity) {
        throw new BadRequestException('You can only view your own activities');
      }

      // Parse pagination parameters
      const currentPage = parseInt(page) || 1;
      const pageLimit = parseInt(limit) || 5; // Default to 5 items per page
      
      // Validate pagination parameters
      if (currentPage < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }
      if (pageLimit < 1 || pageLimit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      const filter: Omit<ActivityFilter, 'userId'> = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type
      };

      const result = await this.userActivityService.findByUserWithPagination(userId, filter, currentPage, pageLimit);
      
      return result;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user activities: ' + error.message);
    }
  }

  @Get('types')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all activity types' })
  async getActivityTypes(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<Record<ActivityType, number>> {
    const filter = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };
    return this.userActivityService.getActivityTypes(filter);
  }

  @Get('test-user/:userId')
  @ApiOperation({ summary: 'Test user endpoint with authentication and pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test successful'
  })
  async testUserEndpoint(
    @Request() req,
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 5;
    
    // Check if activities exist for this user
    const totalActivities = await this.userActivityService.getTotalCountForUser(userId);
    
    return {
      message: 'Test endpoint working',
      requestedUserId: userId,
      authenticatedUser: req.user,
      hasUser: !!req.user,
      hasUserId: !!req.user?.id,
      userRole: req.user?.role,
      totalActivitiesForUser: totalActivities,
      pagination: {
        requestedPage: currentPage,
        requestedLimit: pageLimit,
        note: 'Use /user-activity/user/:userId?page=1&limit=5 for actual paginated data'
      }
    };
  }

  @Get('test-auth')
  @ApiOperation({ summary: 'Test authentication and user ID extraction' })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentication test successful'
  })
  async testAuth(@Request() req) {
    return {
      message: 'Authentication test successful',
      user: req.user,
      userId: req.user?.id,
      hasUser: !!req.user,
      hasUserId: !!req.user?.id
    };
  }
} 