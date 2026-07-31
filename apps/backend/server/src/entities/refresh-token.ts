import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid' })
  @Index()
  sessionId!: string;

  @Column()
  @Index()
  userId!: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ length: 64, unique: true })
  tokenHash!: string;

  @Column({ length: 500, nullable: true })
  deviceInfo?: string;

  @Column({ length: 45, nullable: true })
  ipAddress?: string;

  @Column()
  @Index()
  expiresAt!: Date;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  replacedByTokenId?: number;

  @Column({ nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
