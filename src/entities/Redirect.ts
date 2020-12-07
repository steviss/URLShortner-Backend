import { PrimaryGeneratedColumn, CreateDateColumn, Column, Entity, BaseEntity, ManyToOne, UpdateDateColumn, OneToMany } from 'typeorm';
import { User, Click } from '.';

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

    @OneToMany(() => Click, (click) => click.redirect, { nullable: true })
    clicks: Click[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
