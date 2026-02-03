import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    productId: string; // Foreign Key logic or simple ID reference

    @Column('int')
    quantity: number;

    @Column({ default: 'COMPLETED' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}
