import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createInitialUsers() {
    const users = [
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        isAdmin: true
      },
      {
        username: 'user1',
        password: await bcrypt.hash('user123', 10),
        isAdmin: false
      },
      {
        username: 'user2',
        password: await bcrypt.hash('user123', 10),
        isAdmin: false
      },
      {
        username: 'user3',
        password: await bcrypt.hash('user123', 10),
        isAdmin: false
      }
    ];

    for (const user of users) {
      const existingUser = await this.userModel.findOne({ username: user.username });
      if (!existingUser) {
        await this.userModel.create(user);
      }
    }

    return this.userModel.find().select('-password');
  }
} 