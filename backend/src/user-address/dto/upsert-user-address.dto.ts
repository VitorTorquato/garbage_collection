import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class UpsertUserAddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsLatitude()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsLongitude()
  @IsOptional()
  lng?: number;
}
