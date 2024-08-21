import { Body, Controller, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('register')
  register(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.register(createCompanyDto);
  }
}
