import React from "react";
import UploadFile from "./pages/upload-form";

const apiUrl = "http://localhost:8080/api/upload";

function App() {
  return (
    <div className="App">
      <UploadFile apiUrl={apiUrl} />
    </div>
  );
}

export default App;
