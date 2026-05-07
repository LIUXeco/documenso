/**
 * Migrates DocumentData rows from BYTES_64 (base64 in the database) to S3_PATH
 * (object key in the configured S3-compatible bucket — Supabase Storage in our case).
 *
 * Run:
 *   npx tsx scripts/migrate-documents-to-s3.ts
 *
 * Idempotent: rows already at S3_PATH are skipped. Failures don't roll back
 * previously migrated rows, so the script can be re-run to retry the rest.
 *
 * The script keeps the original base64 in `data` until the upload to S3 succeeds
 * AND the row has been updated. If the script crashes mid-flight, the row is
 * either still BYTES_64 (untouched) or already S3_PATH (migrated). No half states.
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DocumentDataType, PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { customAlphabet } from 'nanoid';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const alphaid = customAlphabet(ALPHABET, 12);

const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
};

const BUCKET = required('NEXT_PRIVATE_UPLOAD_BUCKET');
const ENDPOINT = required('NEXT_PRIVATE_UPLOAD_ENDPOINT');
const REGION = process.env.NEXT_PRIVATE_UPLOAD_REGION || 'us-east-1';
const ACCESS_KEY_ID = required('NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID');
const SECRET_ACCESS_KEY = required('NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY');
const FORCE_PATH_STYLE = process.env.NEXT_PRIVATE_UPLOAD_FORCE_PATH_STYLE === 'true';

const s3 = new S3Client({
  endpoint: ENDPOINT,
  forcePathStyle: FORCE_PATH_STYLE,
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const prisma = new PrismaClient();

const main = async () => {
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Region: ${REGION}`);
  console.log('');

  const rows = await prisma.documentData.findMany({
    where: { type: DocumentDataType.BYTES_64 },
    select: { id: true, data: true, initialData: true, envelopeItem: { select: { title: true } } },
  });

  if (rows.length === 0) {
    console.log('Nothing to migrate. All DocumentData rows are already on S3.');
    return;
  }

  console.log(`Found ${rows.length} document(s) to migrate.\n`);

  let migrated = 0;
  let failed = 0;

  for (const [index, row] of rows.entries()) {
    const label = row.envelopeItem?.title ?? row.id;
    const prefix = `[${index + 1}/${rows.length}]`;

    try {
      const dataBuffer = Buffer.from(row.data, 'base64');
      const initialBuffer = Buffer.from(row.initialData, 'base64');

      const slug =
        (row.envelopeItem?.title ?? 'document')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || 'document';

      const dataKey = `${alphaid()}/${slug}.pdf`;
      const initialKey = `${alphaid()}/${slug}-initial.pdf`;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: dataKey,
          Body: dataBuffer,
          ContentType: 'application/pdf',
        }),
      );

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: initialKey,
          Body: initialBuffer,
          ContentType: 'application/pdf',
        }),
      );

      await prisma.documentData.update({
        where: { id: row.id },
        data: {
          type: DocumentDataType.S3_PATH,
          data: dataKey,
          initialData: initialKey,
        },
      });

      migrated++;
      console.log(`${prefix} OK — "${label}" → ${dataKey}`);
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${prefix} FAIL — "${label}": ${message}`);
    }
  }

  console.log('');
  console.log(`Migrated: ${migrated} | Failed: ${failed} | Total: ${rows.length}`);
};

main()
  .catch((error) => {
    console.error('Fatal:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
