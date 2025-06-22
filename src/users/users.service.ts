import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'department', 'phoneNumber', 'picture', 'lastLoggedIn', 'createdAt', 'updatedAt']
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'department', 'phoneNumber', 'picture', 'lastLoggedIn', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // Update user properties
    Object.assign(user, updateUserDto);
    
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateLastLoggedIn(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoggedIn: new Date()
    });
  }

  async findByDepartment(department: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { department },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'department', 'phoneNumber', 'picture', 'lastLoggedIn', 'createdAt', 'updatedAt']
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'department', 'phoneNumber', 'picture', 'lastLoggedIn', 'createdAt', 'updatedAt']
    });
  }
} 