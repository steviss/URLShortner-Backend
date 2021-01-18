import { PrimaryGeneratedColumn, CreateDateColumn, Column, Entity, BaseEntity, ManyToOne, UpdateDateColumn, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import { User, Click, Collection } from '.';

@Entity()
export class Redirect extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    alias: string;

    @Column()
    url: string;

    @Column({ nullable: true })
    ownerId: string;

    @Column({ type: 'text', nullable: true })
    claimKey: string | null;

    @ManyToOne(() => User, (user) => user.redirects, { nullable: true })
    owner: User;

    @OneToMany(() => Click, (click) => click.redirect, { nullable: true, eager: true })
    clicks: Click[];

    @ManyToMany(() => Collection, { nullable: true, eager: true })
    @JoinTable()
    collections: Collection[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
