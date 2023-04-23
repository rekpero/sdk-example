import React, { useState } from "react";
import axios from "axios";
import Dropzone from "react-dropzone";

interface FileUploadProps {
  apiUrl: string;
}

const UploadFile: React.FC<FileUploadProps> = ({ apiUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(apiUrl, formData);
      console.log("File uploaded successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelection = (files: File[]) => {
    setSelectedFile(files[0]);
  };

  return (
    <div>
      <Dropzone onDrop={handleFileSelection}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {selectedFile ? (
              <p>Selected file: {selectedFile.name}</p>
            ) : (
              <p>Drag and drop a file here or click to select a file</p>
            )}
          </div>
        )}
      </Dropzone>
      <button onClick={handleFileUpload}>Upload File</button>
    </div>
  );
};

export default UploadFile;
