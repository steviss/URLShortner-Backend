import { PrimaryGeneratedColumn, CreateDateColumn, Column, Entity, BaseEntity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from '.';

@Entity()
export class Redirect extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    url: string;

    @Column({ nullable: true })
    ownerId: string;

    @ManyToOne(() => User, (user) => user.redirects, { nullable: true })
    owner: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
