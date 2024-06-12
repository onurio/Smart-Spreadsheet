import React, { useState } from "react";
import { uploadFile, askQuestion } from "~/utils/api";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    try {
      const data = await uploadFile(file);
      setSessionId(data.session_id);
      alert("File uploaded successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAskQuestion = async () => {
    if (!sessionId) {
      alert("Please upload a file first");
      return;
    }

    try {
      const data = await askQuestion(sessionId, question);
      setResponse(data);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Welcome to Remix SPA with FastAPI</h1>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload File</button>
      </div>
      {sessionId && (
        <div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question"
          />
          <button onClick={handleAskQuestion}>Ask</button>
        </div>
      )}
      {response && (
        <div>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
