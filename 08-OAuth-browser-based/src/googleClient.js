window.addEventListener("load", () => {
	const urlParametersJson = parseUrl();

	if (urlParametersJson) {
		getDriveFiles(urlParametersJson.access_token, urlParametersJson.token_type);
	}
});

// parse parameters from the url to json
function parseUrl() {
	// example location: EgP-ifJPDScPZIfeolFOF6my7U-EZJ9FWqCh4lhNUaVs9-zeF9I_Q8mDsaYtEcfDZsKcW2V0Za3vJ06dhaXxdPEBN19H-jX0eil7QUpvD8pqXCOiyPtLzj1XrOB6Kbfhg4KdcC7IuPZ_ve3h888PaCgYKAd0SARESFQG1tDrpwk1v6EQNI3RSzty4oNgirQ0163&token_type=Bearer&expires_in=3599&scope=https://www.googleapis.com/auth/drive.metadata.readonly
	try {
		let parameters = window.location.hash.substring(1).split("&"); // get everything what comes after the hash sign splitted by &
		let parametersJson = {};
		for (parameter of parameters) {
			const [key, value] = parameter.split("=");
			parametersJson[key] = value;
		}
		return parametersJson;
	} catch (e) {
		console.log(e);
		return null;
	}
}

// get list of files on google drive
async function getDriveFiles(accessToken, tokenType) {
	try {
		const response = await fetch("https://www.googleapis.com/drive/v2/files", {
			method: "GET",
			headers: {
				Authorization: `${tokenType} ${accessToken}`,
			},
		});

		const data = await response.json();
		displayData(data);
	} catch (e) {
		console.log(e);
	}
}

// display fetched data
function displayData(data) {
	const files = document.getElementById("files");
	for (const item of data.items) {
		const file = document.createElement("div");
		let innerHtml = "";
		// add folder icon
		if (item.mimeType === "application/vnd.google-apps.folder") {
			innerHtml += `<span class="material-symbols-outlined">folder</span>`;
		}
		// add file icon
		else {
			innerHtml += `<span class="material-symbols-outlined">description</span>`;
		}
		innerHtml += `<a href="${item.embedLink}" class="file-link">${item.title}</a>`;
		file.innerHTML = innerHtml;
		file.classList.add("file");
		files.appendChild(file);
	}
}
