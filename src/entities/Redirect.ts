import { PrimaryGeneratedColumn, CreateDateColumn, Column, Entity, BaseEntity, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Redirect extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    slug: string;

    @Column()
    url: string;

    @Column({ nullable: true })
    ownerId: string;

    @ManyToOne(() => User, (user) => user.redirects, { nullable: true })
    owner: User;

    @CreateDateColumn()
    createdAt: Date;
}
