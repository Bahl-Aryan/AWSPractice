import React, {useState} from "react";
import AWS from 'aws-sdk';
import axios from 'axios';

function App() {
  const [inputText, setInputText] = useState('');
  const [inputFile, setInputFile] = useState(null);

  const handleFileChange = (event) => {
    setInputFile(event.target.files[0]);
  };

  const handleSubmitFile = async(event) => {
    event.preventDefault();
    if (inputFile) {
      try {
        const response = await axios.post('https://5u9w3bkrbc.execute-api.us-east-1.amazonaws.com/prod/get-signed-url', {
          fileName: inputFile.name,
          fileType: inputFile.type
        });

        const { uploadUrl, filePath } = response.data;

        await axios.put(uploadUrl, inputFile, {
          headers: {
            'Content-Type': inputFile.type
          }
        });

        await axios.post('https://5u9w3bkrbc.execute-api.us-east-1.amazonaws.com/prod/save-file', {
          inputText,
          filePath
        });
        alert('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }
  
  return (
    <div className="App">
      <form onSubmit={handleSubmitFile}>
        <div>
          <label>Text Input:</label>
          <input
            type = 'text'
            value = {inputText}
            onChange={(e)=> setInputText(e.target.value)}
          />
        </div>
        <div>
          <label>File Input:</label>
          <input
            type='file'
            onChange={handleFileChange}
          />
        </div>
        <button type='submit'>Submit</button>
      </form>
    </div>
  );
}

export default App;
