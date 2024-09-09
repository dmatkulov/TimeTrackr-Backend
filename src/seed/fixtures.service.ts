import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from '../position/schema/position.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';
import { PositionEnum } from '../utils/enums/position.enum';
import { TagEnum } from '../utils/enums/tag.enum';
import { Company, CompanyDocument } from '../company/schema/company.schema';
import { Team, TeamDocument } from '../team/schema/team.schema';
import { Project, ProjectDocument } from '../project/schema/project.schema';
import { ProjectEnum } from '../utils/enums/project.enum';

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,

    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,

    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async seedPositions() {
    const positions = Object.values(PositionEnum);
    const tagColors = Object.values(TagEnum);

    for (const p of positions) {
      const index = Math.floor(Math.random() * tagColors.length);
      await this.positionModel.create({
        name: p,
        tag:
          p === PositionEnum.NotAssigned ? TagEnum.Default : tagColors[index],
      });
    }
  }

  async seedCompany() {
    const company = new this.companyModel({
      name: 'Neo',
    });

    company.generateId();
    await company.save();

    const position = await this.positionModel.findOne({
      name: PositionEnum.Admin,
    });
    const owner = new this.userModel({
      email: 'admin@gmail.com',
      password: '1Qwerty12-',
      firstname: 'John',
      lastname: 'Space',
      companyID: company._id,
      position: position._id,
      roles: [Role.Owner, Role.Admin],
    });

    owner.generateToken();

    await owner.save();

    const newCompany = await this.companyModel.findByIdAndUpdate(
      company._id,
      { $set: { owner: owner._id } },
      { new: true },
    );
    await newCompany.save();
  }

  async seedUsers() {
    const positions = await this.positionModel.find();

    const assignPosition = (name: PositionEnum) => {
      const pId = positions.filter((position) => position.name === name);
      return pId[0]._id;
    };

    const company = await this.companyModel.findOne();
    const usersData = [
      {
        email: 'lead@gmail.com',
        password: 'qwerty12',
        firstname: 'Дильшад',
        lastname: 'Mаткулов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/dilshad.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.Developer),
        roles: [Role.TeamLead, Role.User],
      },
      {
        email: 'admin@gmail.com',
        password: 'qwerty12',
        firstname: 'Админ',
        lastname: 'Администратор',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/john.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.Admin),
        roles: Role.Admin,
      },
      {
        email: 'manager@gmail.com',
        password: 'qwerty12',
        firstname: 'Назгул',
        lastname: 'Доолоткелдиева',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/nazgul.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.ProjectManager),
        roles: Role.User,
      },
      {
        email: 'frontend@gmail.com',
        password: 'qwerty12',
        firstname: 'Максим',
        lastname: 'Хренов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/maxim.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.Developer),
        roles: Role.User,
      },
      {
        email: 'designer@gmail.com',
        password: 'qwerty12',
        firstname: 'Айжамал',
        lastname: 'Борисова',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/jamal.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.Designer),
        role: Role.User,
      },
      {
        email: 'ux-designer@gmail.com',
        password: 'qwerty12',
        firstname: 'John',
        lastname: 'Doe',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/john.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.DevOps),
        role: Role.User,
      },
      {
        email: 'backend@gmail.com',
        password: 'qwerty12',
        firstname: 'Бектур',
        lastname: 'Исмаилов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/bektur.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.Analyst),
        role: Role.User,
      },
      {
        email: 'tim@gmail.com',
        password: 'qwerty12',
        firstname: 'Тимур',
        lastname: 'Тимуров',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/bektur.jpg',
        companyID: company._id,
        position: assignPosition(PositionEnum.Tester),
        role: Role.User,
      },
    ];

    for (const userData of usersData) {
      const user = new this.userModel(userData);
      user.generateToken();
      await user.save();
    }
  }

  async seedTeams() {
    const company = await this.companyModel.findOne();

    const teamLead = await this.userModel.findOne({ roles: Role.TeamLead });
    const members = await this.userModel.find({
      roles: { $nin: [Role.Owner, Role.Admin, Role.TeamLead] },
    });

    const team = new this.teamModel({
      teamLead: teamLead,
      companyID: company._id,
      name: 'JS20',
      description: 'Группа ESDP Javascript–20',
      isFavorite: [members[0], members[1]],
      members: [members[0], members[1], members[2]],
    });

    await team.save();
  }

  async seedProjects() {
    const team = await this.teamModel.findOne();
    const teamLead = await this.userModel.findOne({ roles: Role.TeamLead });
    const members = await this.userModel.find({
      roles: { $nin: [Role.Owner, Role.Admin, Role.TeamLead] },
    });

    const project = new this.projectModel({
      companyID: teamLead.companyID,
      teamID: team,
      teamLead: teamLead,
      name: 'Task management app',
      description: 'Приложение для менеджмента задач для молодых компаний',
      deadline: '2024-10-01',
      isFavorite: [members[0], members[1]],
      type: ProjectEnum.NEW_PRODUCT_LAUNCH,
      tasks: [
        {
          user: members[0],
          executionDate: '2024-09-20',
          title: 'Создать дизайн-систему',
          timeExpected: '9h',
        },
        {
          user: members[1],
          executionDate: '2024-09-20',
          title: 'Создать дизайн главной страницы',
          timeExpected: '3h',
        },
      ],
    });

    await project.save();

    const project2 = new this.projectModel({
      companyID: teamLead.companyID,
      teamID: team,
      teamLead: teamLead,
      name: 'Web design',
      description: 'Дизайн веб сайта',
      deadline: '2024-11-01',
      isFavorite: [members[0], members[1], members[2], members[3]],
      type: ProjectEnum.NEW_PRODUCT_LAUNCH,
      tasks: [
        {
          user: members[0],
          executionDate: '2024-09-20',
          title: 'Создать дизайн-систему',
          timeExpected: '9h',
        },
        {
          user: members[1],
          executionDate: '2024-09-20',
          title: 'Создать дизайн главной страницы',
          timeExpected: '3h',
        },
      ],
    });

    await project2.save();
  }
}
