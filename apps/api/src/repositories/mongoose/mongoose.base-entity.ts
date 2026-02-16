import { Types } from 'mongoose';
import { Prop } from '@nestjs/mongoose';

export class MongooseBaseEntity {
  _id?: Types.ObjectId;

  /** Set automatically when entity is tenant-scoped and request has a resolved tenant. */
  @Prop({ type: String, required: false })
  tenantId?: string;

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}
