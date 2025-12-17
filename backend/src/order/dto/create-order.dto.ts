import {
  ArrayMinSize,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemInputDto } from './order-item-input.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'df1e-a92c-xx-1234' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : String(value),
  )
  cartId?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsPhoneNumber('IN')
  phone: string;

  @ApiProperty({ example: 'Coimbatore, Tamil Nadu (full address/place)' })
  @IsString()
  @MinLength(3)
  place: string;

  @ApiProperty({ type: [OrderItemInputDto] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  @ArrayMinSize(1)
  items: OrderItemInputDto[];
}
