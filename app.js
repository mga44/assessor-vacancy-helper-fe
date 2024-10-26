document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map and set its view to Poland
    const map = L.map('map').setView([52.237, 19.015], 6);  // Center on Poland with a closer zoom level
  
    // Add OpenStreetMap tiles as the base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // Select the table and its body
    const table = document.getElementById('coordinates-table');
    const tableHead = table.querySelector('thead tr');
    const tableBody = table.querySelector('tbody');
  
    // Create a single popup instance
    const popup = L.popup();
  
    // Fetch JSON data and plot on the map and table
    fetch('coordinates.json')
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          // Track added headers to avoid duplicates
          const headers = Object.keys(data[0]);
          const addedHeaders = new Set();
  
          headers.forEach(header => {
            if (!addedHeaders.has(header)) {
              const th = document.createElement('th');
              th.textContent = header.charAt(0).toUpperCase() + header.slice(1);
              tableHead.appendChild(th);
              addedHeaders.add(header);
            }
          });
  
          // Create a map to group markers by latitude and longitude
          const markerGroups = {};
  
          // Populate table rows and prepare markers
          data.forEach(coord => {
            const { latitude, longitude } = coord;
            const key = `${latitude},${longitude}`;
  
            // Group markers by coordinates
            if (!markerGroups[key]) {
              markerGroups[key] = [];
            }
            markerGroups[key].push(coord);
  
            const row = document.createElement('tr');
  
            headers.forEach(field => {
              const cell = document.createElement('td');
              cell.textContent = coord[field];
              row.appendChild(cell);
            });
  
            tableBody.appendChild(row);
          });
  
          // Add markers to the map
          Object.keys(markerGroups).forEach(key => {
            const [lat, long] = key.split(',').map(Number);
            const markersData = markerGroups[key];
  
            // Create a marker for the grouped coordinates
            const marker = L.marker([lat, long]).addTo(map);
  
            // Add a click event to the marker to display merged JSON object details in a popup
            marker.on('click', function() {
              let details = '';
              markersData.forEach(coord => {
                details += '<strong>Details:</strong><br>';
                headers.forEach(header => {
                  details += `${header.charAt(0).toUpperCase() + header.slice(1)}: ${coord[header]}<br>`;
                });
                details += '<br>'; // Add a line break between different objects
              });
  
              // Set the content and open the popup
              popup.setContent(details);
              popup.setLatLng([lat, long]); // Set the position of the popup
              popup.openOn(map); // Open the popup on the map
            });
          });
        }
      })
      .catch(error => console.error('Error loading JSON:', error));
  });
  