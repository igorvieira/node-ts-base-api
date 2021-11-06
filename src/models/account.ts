import mongoose, { Document, Model, Schema } from 'mongoose';
import AuthService from '@src/services/auth';
import logger from '@src/logger';

export interface Account {
  _id?: string;
  username: string;
  password: string;
  social: string;
  user: string;
}

interface AccountModel extends Omit<Account, '_id'>, Document {}

const schema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    social: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.pre<AccountModel>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (err) {
    logger.error(`Error hashing the password for the user ${this.username}`, err);
  }
});

interface AccountModel extends Omit<Account, '_id'>, Document {}
export const Account: Model<AccountModel> = mongoose.model('Account', schema);