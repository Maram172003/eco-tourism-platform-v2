import { connect, connection } from 'mongoose';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../../../.env') });

/**
 * Migration de nettoyage : la table ORM `certifications` est désormais la
 * source de vérité unique (workflow admin pending → approved). Les anciennes
 * certifications « fausses » stockées dans Mongo `guide_skills.certifications`
 * (labels sans preuve, générées par les onboardings passés) sont vidées.
 */
async function cleanup() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecovoyage';
  await connect(uri);
  console.log('Mongo connected');

  const col = connection.collection('guide_skills');
  const withCerts = await col.countDocuments({
    certifications: { $type: 'array', $ne: [] },
  });
  const result = await col.updateMany(
    { certifications: { $type: 'array', $ne: [] } },
    { $set: { certifications: [] } },
  );

  console.log(
    `docs avec certifications Mongo à vider : ${withCerts} → modifiées : ${result.modifiedCount}`,
  );

  await connection.close();
  console.log('Done.');
}

cleanup().catch((err) => {
  console.error(err);
  process.exit(1);
});
