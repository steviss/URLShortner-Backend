import { Redirect } from '.';
import { PrimaryGeneratedColumn, CreateDateColumn, Column, Entity, BaseEntity, ManyToOne } from 'typeorm';

@Entity()
export class Click extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    redirectId: number;

    @Column({ nullable: true })
    referer: string;

    @Column()
    address: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Redirect, (redirect) => redirect.clicks)
    redirect: Redirect;
}
