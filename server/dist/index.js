"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const storage_1 = require("@spheron/storage");
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, express_fileupload_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
}));
// IPFS client
// const ipfs = new IPFS({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
// });
const PORT = 8080;
const client = new storage_1.SpheronClient({
    token: process.env.SPHERON_TOKEN || "",
});
// Upload endpoint
app.post("/api/upload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files) {
        return res.status(400).send("No files were uploaded.");
    }
    const file = req.files.file;
    const filePath = `uploads/${file.name}`;
    try {
        // Save file to server
        yield file.mv(filePath);
        console.log("Done");
        // Upload file to IPFS
        // const fileStream = fs.createReadStream(filePath);
        // const { cid } = await ipfs.add(fileStream);
        let currentlyUploaded = 0;
        const { uploadId, bucketId, protocolLink, dynamicLinks } = yield client.upload(filePath, {
            protocol: storage_1.ProtocolEnum.IPFS,
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
        fs_1.default.unlinkSync(filePath);
        res.status(200).json({ uploadId, bucketId, protocolLink, dynamicLinks });
    }
    catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
}));
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
