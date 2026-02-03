import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number;
}
