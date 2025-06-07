// File: photo-uploader.js
// This file provides JavaScript interop functionality for handling photos in the web version

// Ensure the global PhotoUploader object exists before Blazor tries to access it
window.PhotoUploader = window.PhotoUploader || {};

// Function to open a file picker and get the selected file as a base64 string
window.PhotoUploader.pickPhotoAsBase64 = async function () {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                resolve(null);
                return;
            }
            console.log("PhotoUploader: User selected a photo:", file.name);
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    console.log("PhotoUploader: Sending photo:", file.name);
                    resolve({
                        Data: base64String,
                        Filename: file.name,
                        ContentType: file.type
                    });
                    console.log("PhotoUploader: Completed sending photo:", file.name);
                };
                reader.onerror = () => {
                    console.error("PhotoUploader: Error reading file:", file.name);
                    reject(new Error('Failed to read file'));
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error("PhotoUploader: Exception caught:", error);
                reject(error);
            }
        };

        // Trigger the file picker
        fileInput.click();
    });
};

// Function to pick multiple photos and return them as an array of base64 encoded photos
window.PhotoUploader.pickMultiplePhotosAsBase64 = async function () {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true; // Allow multiple file selection

        // Add to DOM to ensure events fire in all browsers
        document.body.appendChild(fileInput);

        fileInput.onchange = async (event) => {
            const files = Array.from(event.target.files);
            if (!files || files.length === 0) {
                resolve([]);
                document.body.removeChild(fileInput);
                return;
            }
            console.info("PhotoUploader: User selected", files.length, "photos:", files.map(f => f.name));
            try {
                const photoPromises = files.map(file => {
                    console.info("PhotoUploader: Begin sending photo:", file.name);
                    return new Promise((resolveFile, rejectFile) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64String = reader.result.split(',')[1];
                            resolveFile({
                                Data: base64String,
                                Filename: file.name,
                                ContentType: file.type
                            });
                            console.info("PhotoUploader: Completed sending photo:", file.name);
                        };
                        reader.onerror = () => {
                            console.error("PhotoUploader: Error reading file:", file.name);
                            rejectFile(new Error(`Failed to read file: ${file.name}`));
                        };
                        reader.readAsDataURL(file);
                    });
                });

                const results = await Promise.all(photoPromises);
                resolve(results);
            } catch (error) {
                console.error("PhotoUploader: Exception caught:", error);
                reject(error);
            } finally {
                document.body.removeChild(fileInput);
            }
        };

        // Trigger the file picker
        console.info("PhotoUploader: picking");
        fileInput.click();
    });
};

console.info("PhotoUploader loaded", window.PhotoUploader);
