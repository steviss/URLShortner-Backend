import { PrimaryGeneratedColumn, CreateDateColumn, Column, Entity, BaseEntity, ManyToOne, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Redirect, User } from '.';

@Entity()
export class Collection extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    name: string;

    @Column()
    ownerId: string;

    @ManyToOne(() => User, (user) => user.collections)
    owner: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => Redirect, (redirect) => redirect.collections)
    redirects: Redirect[];
}
