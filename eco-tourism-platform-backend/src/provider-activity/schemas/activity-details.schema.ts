import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDetailsDocument = ActivityDetails & Document;

@Schema({ collection: 'activity_details', timestamps: true })
export class ActivityDetails {
  // Lien vers provider_activities.id (PostgreSQL)
  @Prop({ required: true, index: true })
  activity_id!: string;

  @Prop({ required: true, index: true })
  organization_id!: string;

  @Prop({ required: true })
  provider_id!: string;

  @Prop({ required: true })
  level!: string;

  @Prop({ required: true })
  category!: string;

  // Champs dynamiques par sous-type
  // ex: { dortoir: { capacity: 20, price: 50 }, suite: { capacity: 2 } }
  @Prop({ type: Object, default: {} })
  fields!: Record<string, Record<string, any>>;

  // Photos par sous-type
  // ex: { dortoir: ["url1"], suite: ["url2"], general: ["url3"] }
  @Prop({ type: Object, default: {} })
  photos!: Record<string, string[]>;

  // Certifications liées à cette activité
  // ex: [{ name: "Brevet PADI", document_url: "https://..." }]
  @Prop({
    type: [{ name: String, document_url: String }],
    default: [],
  })
  certifications!: Array<{ name: string; document_url?: string }>;
}

export const ActivityDetailsSchema = SchemaFactory.createForClass(ActivityDetails);
