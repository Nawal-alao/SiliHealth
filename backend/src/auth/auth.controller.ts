import { Body, Controller, Post, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      });
      return new HttpException({
        ok: false,
        error: 'Validation failed',
        details: messages
      }, HttpStatus.BAD_REQUEST);
    }
  }))
  async signup(@Body() body: SignupDto) {
    try {
      return await this.auth.signup(body);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        ok: false,
        error: 'Registration failed',
        details: error.message
      };
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true
  }))
  async login(@Body() body: LoginDto) {
    try {
      return await this.auth.login(body);
    } catch (error) {
      return {
        ok: false,
        error: 'Login failed',
        details: error.message
      };
    }
  }
}
