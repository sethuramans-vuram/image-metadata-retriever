import sharp from "sharp";
import fastifyServer from "fastify";
import fastifyMultipart from "fastify-multipart";
import fastifyBasicAuth from "fastify-basic-auth";
import exif from "exif-reader";
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

// loads env file
dotenv.config();

const prisma = new PrismaClient();

const fastify = fastifyServer({ logger: true });

// register multipart request
fastify.register(fastifyMultipart, {
  limits: {
    files: 1,
    fileSize: 10 * 1000 * 1000, // 10 MB
  },
});

// add basic auth
fastify.register(fastifyBasicAuth, { validate });

function validate(username, password, req, res, done) {
  if (username === process.env.BASIC_AUTH_USER && password === process.env.BASIC_AUTH_PASS) {
    done();
  } else {
    done(new Error("Invalid Username/Password"));
  }
};

fastify.after(() => {
  fastify.addHook('onRequest', fastify.basicAuth);

  fastify.post("/metadata", async (req, res) => {
    try {
      const file = await req.file();
      let metadata = await sharp(
        await file.toBuffer()
      ).metadata();
      metadata = metadata.hasOwnProperty("exif")
        ? { ...metadata, exif: exif(metadata.exif) }
        : metadata;
      const data = await prisma.images.create({
        data: {
          filename: file.filename,
          properties: JSON.stringify(metadata),
          batch_id: "Random",
          batch_name: "Random"
        }
      });
      console.log({ data });
      return metadata;
    } catch (err) {
      console.log(err);
      return {};
    }
  });
});

const start = async () => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
