function updateFileNameDisplay() {
  const fileInput = document.getElementById("fileInput");
  const fileNameDisplay = document.getElementById("fileNameDisplay");

  if (fileInput.files.length > 0) {
    fileNameDisplay.textContent = `Selected file: ${fileInput.files[0].name}`;
  } else {
    fileNameDisplay.textContent = "No file chosen";
  }
}


document.getElementById("fileInput").addEventListener("change", updateFileNameDisplay);


async function generateKey(password) {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBytes);
  const keyBytes = new Uint8Array(hashBuffer).slice(0, 32); 

  const key = await crypto.subtle.importKey(
    "raw", 
    keyBytes, 
    { name: "AES-CBC" }, 
    false, // 
    ["encrypt", "decrypt"] // 
  );

  return key;
}

async function encryptFile() {
  const fileInput = document.getElementById("fileInput");
  const password = prompt("Enter a password for encryption:");

  if (!fileInput.files[0] || !password) {
    alert("Please select a file and enter a password.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (event) {
    const fileData = new Uint8Array(event.target.result);

    try {

      const key = await generateKey(password);


      const iv = crypto.getRandomValues(new Uint8Array(16));

      const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv }, 
        key, 
        fileData 
      );

      
      const result = new Uint8Array(iv.length + encryptedData.byteLength);
      result.set(iv, 0); 
      result.set(new Uint8Array(encryptedData), iv.length); 
        
     
      const encryptedBlob = new Blob([result], { type: "application/octet-stream" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(encryptedBlob);
      downloadLink.download = `encrypted_${file.name}`;
      downloadLink.click();

      alert("File encrypted successfully!");
    } catch (error) {
      alert("Encryption failed: " + error.message);
    }
  };

  
  reader.readAsArrayBuffer(file);
}


async function decryptFile() {
  const fileInput = document.getElementById("fileInput");
  const password = prompt("Enter the password for decryption:");

  if (!fileInput.files[0] || !password) {
    alert("Please select a file and enter a password.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (event) {
    const fileData = new Uint8Array(event.target.result);

    try {
      
      const key = await generateKey(password);

    
      const iv = fileData.slice(0, 16);
      const encryptedData = fileData.slice(16);

   
      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },  
        key, 
        encryptedData 
      );

      
      const decryptedBlob = new Blob([decryptedData], { type: "application/octet-stream" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(decryptedBlob);
      downloadLink.download = `decrypted_${file.name}`;
      downloadLink.click();

      alert("File decrypted successfully!");
    } catch (error) {
      alert("Decryption failed: " + error.message);
    }
  };

  
  reader.readAsArrayBuffer(file);
}