import { Types } from 'mongoose';
import { Prop } from '@nestjs/mongoose';

export class MongooseEntity {
  _id?: Types.ObjectId;

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}
