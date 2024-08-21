import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/shema/user.schema';
import mongoose, { Model, mongo } from 'mongoose';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { AuthDto } from './auth.dto';

const client = new OAuth2Client(process.env['GOOGLE_CLIENT_ID']);

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });

    if (user) {
      const passwordIsCorrect = await user.checkPassword(pass);

      if (passwordIsCorrect) {
        user.generateToken();
        await user.save();

        return user;
      }
    }

    throw new UnauthorizedException('Введите корректные данные!');
  }

  async register(file: Express.Multer.File, createUserDto: AuthDto) {
    try {
      const newUser = new this.userModel({
        email: createUserDto.email,
        password: createUserDto.password,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        roles: createUserDto.role,
      });

      newUser.generateToken();

      await newUser.save();

      const user = await this.userModel.findById(newUser._id);
      return { message: 'Регистрация прошла успешно', user };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        const error = {
          message: [
            {
              property: 'email',
              message: 'Такая почта уже была зарегистрирована',
            },
          ],
          error: 'Unprocessable Entity',
          statusCode: 422,
        };
        throw new UnprocessableEntityException(error);
      }

      throw e;
    }
  }

  async login(activeUser: UserDocument) {
    const user = await this.userModel.findById(activeUser._id);
    return { message: `С возвращением, ${user.firstname}!`, user };
  }

  async google(req: Request) {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env['GOOGLE_CLIENT_ID'],
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new BadRequestException('Google login error!');
    }

    const id = payload['sub'];
    const email = payload['email'];
    const firstname = payload['given_name'];
    const lastname = payload['family_name'];
    const photo = payload['picture'];

    if (!email) {
      throw new BadRequestException('Email is not present!');
    }

    let googleUser = await this.userModel.findOne({ googleID: id });

    let message: string;
    if (!googleUser) {
      googleUser = new this.userModel({
        email,
        firstname,
        lastname,
        photo,
        password: randomUUID(),
        googleID: id,
        isGoogleUser: true,
      });

      message = `Привет, ${googleUser.firstname}`;
    } else {
      message = `С возвращением, ${googleUser.firstname}!`;
    }

    googleUser.generateToken();
    await googleUser.save();

    const user = await this.userModel.findOne({ googleID: id });

    return { message, user };
  }

  async logOut(req: Request) {
    const headerValue = req.get('Authorization');
    const successMessage = { message: 'Вы вышли из системы' };

    if (!headerValue) {
      return successMessage;
    }

    const [_bearer, token] = headerValue.split(' ');

    if (!token) {
      return successMessage;
    }

    const user = await this.userModel.findOne({ token });

    if (!user) {
      return successMessage;
    }

    user.generateToken();
    await user.save();

    return successMessage;
  }
}
