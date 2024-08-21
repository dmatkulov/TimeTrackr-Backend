import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schema/company.schema';
import mongoose, { Model } from 'mongoose';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  @InjectModel(Company.name)
  private readonly companyModel: Model<CompanyDocument>;

  async register(dto: CreateCompanyDto) {
    try {
      const company = new this.companyModel({
        name: dto.name,
      });

      company.generateId();
      await company.save();

      return company;
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }
}
