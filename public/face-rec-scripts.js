document.addEventListener('DOMContentLoaded', async () => {
    const userRadioButtonsDiv = document.getElementById('userRadioButtons');

    // Fetch the list of usernames from the server
    const response = await fetch('/usernames');
    const usernames = await response.json();

    // Create radio buttons for each username with a view profile button
    usernames.forEach(username => {
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.id = username;
        radioButton.name = 'username';
        radioButton.value = username;

        const label = document.createElement('label');
        label.htmlFor = username;
        label.textContent = username;

        const viewProfileButton = document.createElement('button');
        viewProfileButton.textContent = 'View Profile';
        viewProfileButton.onclick = () => viewProfile(username);

        userRadioButtonsDiv.appendChild(radioButton);
        userRadioButtonsDiv.appendChild(label);
        userRadioButtonsDiv.appendChild(viewProfileButton);
        userRadioButtonsDiv.appendChild(document.createElement('br'));
    });
});

// Function to view the profile of the selected user
const viewProfile = async (username) => {
    const response = await fetch(`/userProfile/${username}`);
    const userProfile = await response.json();

    const userProfileDiv = document.getElementById('userProfile');
    userProfileDiv.innerHTML = `
        <h2>User Profile</h2>
        <p>Name: ${userProfile.name}</p>
        <p>IC Number: ${userProfile.icNumber}</p>
        <p>Latitude: ${userProfile.latitude}</p>
        <p>Longitude: ${userProfile.longitude}</p>
        <p>Address: <span id="address">Loading...</span></p>
        <img src="${userProfile.pic1}" id="pic1Face" alt="Pic1 Face">
        <img src="${userProfile.pic2}" id="pic2Face" alt="Pic2 Face">
        <div id="matchStatus"></div> <!-- Element to display match status -->
        <div>
            <label for="verifiedStatus">Verified:</label>
            <input type="radio" id="verifiedStatus" name="status" value="verified">
            <label for="notVerifiedStatus">Not Verified:</label>
            <input type="radio" id="notVerifiedStatus" name="status" value="notVerified">
        </div>
        <button onclick="updateStatus()">Update Status</button>
    `;

    // Call run function to perform facial recognition on the fetched images
    run(userProfile.pic1, userProfile.pic2);

    // Convert latitude and longitude to address
    getAddress(userProfile.latitude, userProfile.longitude);
};

// Function to perform the facial recognition process
const run = async (pic1, pic2) => {
    // Load the faceapi models
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    ]);

    // Reference Face for Face to compare
    const refFace = await faceapi.fetchImage(pic1); // Use pic1 as reference
    const facetoCheck = await faceapi.fetchImage(pic2); // Use pic2 for comparison

    // We grab the image and hand it to detectAllFaces method
    let refFaceAIData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors();
    console.log("refFaceAIData Loaded!");
    let facestoCheckAIData = await faceapi.detectAllFaces(facetoCheck).withFaceLandmarks().withFaceDescriptors();
    console.log("facestoCheckAIData Loaded!");

    // Get canvas and set it on top of the image
    const canvas = document.getElementById('canvas');
    faceapi.matchDimensions(canvas, facetoCheck);

    // Draw face matcher
    let faceMatcher = new faceapi.FaceMatcher(refFaceAIData);
    facestoCheckAIData = faceapi.resizeResults(facestoCheckAIData, facetoCheck);

    // Initialize match status
    let matchStatus = "Face Doesn't Match! Status: Red!";

    // Loop through all faces in the image to check and compare to reference data
    facestoCheckAIData.forEach(face => {
        const { descriptor } = face;
        let accuracy = faceMatcher.findBestMatch(descriptor);

        if (accuracy._distance <= 0.6) {
            matchStatus = `Face Matched!`;
        }
        else {
            matchStatus = `Face Doesn't Match!`;
        }
    });

    // Display the match status on the webpage
    const matchStatusElement = document.getElementById('matchStatus');
    matchStatusElement.textContent = matchStatus;
};

// Function to get the selected username from radio buttons
const getSelectedUsername = () => {
    const selectedRadio = document.querySelector('input[name="username"]:checked');
    return selectedRadio ? selectedRadio.value : null;
};

// Function to update the status of the selected user
const updateStatus = async () => {
    const username = getSelectedUsername(); // Get selected username from radio buttons
    const status = document.querySelector('input[name="status"]:checked')?.value;

    // Ensure both username and status are selected
    if (!username || !status) {
        alert('Please select a username and a status.');
        return;
    }

    try {
        // Send the updated status to the server
        const response = await fetch(`/update-status/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        // Check if the update was successful
        if (response.ok) {
            alert('Status updated successfully.');
        } else {
            throw new Error('Failed to update status.');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again later.');
    }
};

// Function to get address from latitude and longitude
const getAddress = async (latitude, longitude) => {
    const apiKey = 'AIzaSyB04_VuymLMqSOH8tKlIV-wZrCp7Yt_wKE'; // Replace with your Google Maps API key
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            document.getElementById('address').textContent = address;
        } else {
            document.getElementById('address').textContent = 'Address not found';
        }
    } catch (error) {
        console.error('Error getting address:', error);
        document.getElementById('address').textContent = 'Error fetching address';
    }
};
