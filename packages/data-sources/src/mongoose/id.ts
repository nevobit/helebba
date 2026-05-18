import mongoose from 'mongoose';
import { v7 as uuidv7 } from 'uuid';

export function configureMongoose() {
  const uuidPlugin = function (schema: mongoose.Schema) {
    schema.add({
      _id: { type: String, default: uuidv7 },
    });

    schema.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    });

    schema.set('toObject', {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    });
  };

  mongoose.plugin(uuidPlugin);
}
