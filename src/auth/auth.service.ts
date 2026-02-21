import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { NotFound } from '@aws-sdk/client-s3';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    return this.login(user);
  }

  async me(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    const {
      password,
      createdAt,
      isActive,
      updatedAt,
      profilePic,
      phone,
      ...result
    } = user;
    return result;
  }
}
