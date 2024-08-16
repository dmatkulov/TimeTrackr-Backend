import { IsEnum, IsNotEmpty } from 'class-validator';
import { PositionEnum } from '../../utils/enums/position.enum';
import { TagEnum } from '../../utils/enums/tag.enum';

export class CreatePositionDto {
  @IsNotEmpty()
  @IsEnum(PositionEnum)
  name: PositionEnum;

  @IsNotEmpty()
  @IsEnum(TagEnum)
  tag: TagEnum;
}
