import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private analyticsService: AnalyticsService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check for existing email
    const existingUserByEmail = await this.userRepository.findOne({ 
      where: { email: registerDto.email } 
    });
    
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check for existing phone number
    const existingUserByPhone = await this.userRepository.findOne({ 
      where: { phoneNumber: registerDto.phoneNumber } 
    });
    
    if (existingUserByPhone) {
      throw new ConflictException('Phone number already exists');
    }

    const user = this.userRepository.create(registerDto);
    await this.userRepository.save(user);

    // Record analytics event for registration
    if (this.analyticsService) {
      await this.analyticsService.recordEvent(
        'user_register',
        { count: 1 },
        user.id,
        { email: user.email }
      );
    }

    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ 
      where: { email: loginDto.email } 
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last logged in timestamp
    user.lastLoggedIn = new Date();
    await this.userRepository.save(user);

    // Record analytics event for login
    if (this.analyticsService) {
      await this.analyticsService.recordEvent(
        'user_login',
        { count: 1 },
        user.id,
        { email: user.email }
      );
    }

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };
    
    const token = this.jwtService.sign(payload);

    const { password, ...userDetails } = user;

    return {
      access_token: token,
      user: userDetails
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...userDetails } = user;
    return userDetails;
  }
} 