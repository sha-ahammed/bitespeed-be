import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum LinkPrecedence {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, type: 'varchar' })
  phoneNumber!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ nullable: true, type: 'integer' })
  linkedId!: number | null;

  @Column({
    type: 'enum',
    enum: LinkPrecedence,
    default: LinkPrecedence.PRIMARY,
  })
  linkPrecedence!: LinkPrecedence;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
