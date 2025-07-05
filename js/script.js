// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch ISS position
const fetchISSPosition = async () => {
  try {
    const response = await fetch("http://api.open-notify.org/iss-now.json");
    const data = await response.json();
    const latitude = data.iss_position.latitude;
    const longitude = data.iss_position.longitude;
    document.getElementById("issPosition").innerHTML = `
      <h5 class="card-title">Current ISS Position!</h5>
      <p class="card-text">Latitude: ${latitude}, Longitude: ${longitude}</p>
    `;
  } catch (error) {
    console.error("Error fetching ISS data:", error);
  }
};

// Fetch APOD images
const fetchAPODImages = async (startDate, endDate) => {
  try {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "🔄 Loading space photos...";
    const apiKey = "TvF5iQrkFLEPkXB1s2IPt7z5bCTr0Sc2G5Gtj1Ki";
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);
    const data = await response.json();

    // Filter out .swf and unsupported media types, log skipped entries
    const filteredData = data.filter(entry => {
      if (
        !entry.url ||
        entry.url.endsWith('.swf') ||
        (entry.media_type !== 'image' && entry.media_type !== 'video')
      ) {
        // Log skipped entries for debugging
        console.warn("Skipped APOD entry:", entry);
        return false;
      }
      return true;
    });

    let galleryHTML = "";
    if (filteredData.length === 0) {
      // Show message if no valid entries
      galleryHTML = `
        <div class="alert alert-warning mt-3" role="alert">
          ⚠️ No valid image or video entries found in this date range.
        </div>
      `;
    } else {
      filteredData.forEach((entry, index) => {
        if (entry.media_type === "image") {
          galleryHTML += `
            <div class="card mb-3" style="cursor:pointer;" data-index="${index}">
              <img src="${entry.url}" class="card-img-top" alt="APOD">
              <div class="card-body">
                <h5 class="card-title">${entry.title}</h5>
                <p class="card-text">${entry.date}</p>
              </div>
            </div>
          `;
        } else if (entry.media_type === "video") {
          galleryHTML += `
            <div class="card mb-3" style="cursor:pointer;" data-index="${index}">
              <div class="ratio ratio-16x9"><iframe src="${entry.url}" title="APOD video"></iframe></div>
              <div class="card-body">
                <h5 class="card-title">${entry.title}</h5>
                <p class="card-text">${entry.date}</p>
              </div>
            </div>
          `;
        }
      });
    }
    // Always clear loading message and show gallery or warning
    gallery.innerHTML = galleryHTML;

    // Modal logic uses filteredData now
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const index = card.getAttribute("data-index");
        const apod = filteredData[index];
        const modalContent = document.querySelector("#apodModal .modal-content");
        modalContent.innerHTML = `
          <div class="modal-header">
            <h5 class="modal-title">${apod.title} - ${apod.date}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${apod.media_type === "image"
              ? `<img src="${apod.hdurl || apod.url}" class="img-fluid" alt="APOD">`
              : `<div class="ratio ratio-16x9"><iframe src="${apod.url}" title="APOD video"></iframe></div>`
            }
            <p class="mt-3">${apod.explanation}</p>
          </div>
        `;
        const modal = new bootstrap.Modal(document.getElementById("apodModal"));
        modal.show();
      });
    });
  } catch (error) {
    console.error("Error fetching APOD data:", error);
  }
};

// Event listener for button
document.querySelector("button").addEventListener("click", () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  fetchAPODImages(startDate, endDate);
});

// Initial calls
fetchISSPosition();

// Event listener for button
document.querySelector("button").addEventListener("click", () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  fetchAPODImages(startDate, endDate);
});

// Initial calls
fetchISSPosition();
