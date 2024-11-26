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
