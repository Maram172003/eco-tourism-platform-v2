import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'activity_details' })
export class ActivityDetails extends Document {
  @Prop({ required: true }) provider_id!: string;
  @Prop({ required: true }) organization_id!: string;
  @Prop({ type: Object, default: {} }) details!: Record<string, unknown>;
  @Prop({ type: [String], default: [] }) certifications!: string[];
  @Prop({ type: [String], default: [] }) photos!: string[];
  @Prop({ type: Object, default: {} }) metadata!: Record<string, unknown>;
}

export const ActivityDetailsSchema = SchemaFactory.createForClass(ActivityDetails);
