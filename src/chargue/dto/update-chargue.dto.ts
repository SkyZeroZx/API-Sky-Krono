import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateChargueDto } from './create-chargue.dto';

export class UpdateChargueDto extends PartialType(CreateChargueDto) {
    @ApiProperty()
    @IsNotEmpty()
    codChargue: number;
    
}
