import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schema/company.schema';
import mongoose, { Model } from 'mongoose';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Role } from '../utils/enums/role.enum';
import { AuthService } from '../auth/auth.service';
import { Position, PositionDocument } from '../position/schema/position.schema';

@Injectable()
export class CompanyService {
  constructor(private authService: AuthService) {}

  @InjectModel(Company.name)
  private readonly companyModel: Model<CompanyDocument>;

  @InjectModel(Position.name)
  private readonly positionModel: Model<PositionDocument>;

  async register(dto: CreateCompanyDto) {
    try {
      const existingCompany = await this.companyModel.findOne({
        name: dto.name,
      });

      if (existingCompany) {
        const error = {
          message: [
            {
              property: 'name',
              message: 'Такая организация уже была зарегистрирована',
            },
          ],
          error: 'Unprocessable Entity',
          statusCode: 422,
        };
        throw new UnprocessableEntityException(error);
      }

      const company = new this.companyModel({
        name: dto.name,
      });

      company.generateId();
      await company.save();

      const position = await this.positionModel.findOne({ name: 'Владелец' });
      const owner = await this.authService.register({
        ...dto.owner,
        companyID: company.companyID,
        position: position._id,
        roles: [Role.Owner, Role.Admin],
      });

      const newCompany = await this.companyModel.findByIdAndUpdate(
        company._id,
        { $set: { owner: owner.user._id } },
        { new: true },
      );
      await newCompany.save();

      const userData = await this.companyModel
        .findOne(company._id)
        .populate('owner');

      return {
        message: 'Регистрация компании прошла успешно',
        user: userData.owner,
      };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }
}
