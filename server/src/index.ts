import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import { SpheronClient, ProtocolEnum } from "@spheron/storage";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(fileUpload());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  })
);

// IPFS client
// const ipfs = new IPFS({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
// });
const PORT = 8080;
const client = new SpheronClient({
  token: process.env.SPHERON_TOKEN || "",
});

// Upload endpoint
app.post("/api/upload", async (req: Request, res: Response) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.file as fileUpload.UploadedFile;
  const filePath = `uploads/${file.name}`;

  try {
    // Save file to server
    await file.mv(filePath);
    console.log("Done");

    // Upload file to IPFS
    // const fileStream = fs.createReadStream(filePath);
    // const { cid } = await ipfs.add(fileStream);
    let currentlyUploaded = 0;
    const { uploadId, bucketId, protocolLink, dynamicLinks } =
      await client.upload(filePath, {
        protocol: ProtocolEnum.IPFS,
        name: file.name,
        onUploadInitiated: (uploadId) => {
          console.log(`Upload with id ${uploadId} started...`);
        },
        onChunkUploaded: (uploadedSize, totalSize) => {
          currentlyUploaded += uploadedSize;
          console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
        },
      });

    console.log(uploadId, bucketId, protocolLink, dynamicLinks);
    // Delete file from server
    fs.unlinkSync(filePath);

    res.status(200).json({ uploadId, bucketId, protocolLink, dynamicLinks });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
