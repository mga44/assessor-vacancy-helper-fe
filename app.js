document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([52.237, 19.015], 6);  // Center on Poland with a closer zoom level
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    const table = document.getElementById('coordinates-table');
    const tableHead = table.querySelector('thead tr');
    const tableBody = table.querySelector('tbody');
    const popup = L.popup();
    let originalData = []; // Store original JSON data for filtering
    let markerGroups = {}; // Store markers by coordinates
  
    fetch('coordinates.json')
      .then(response => response.json())
      .then(data => {
        originalData = data;
        populateTableAndMap(data); // Populate with the initial unfiltered data
      })
      .catch(error => console.error('Error loading JSON:', error));
  
    function populateTableAndMap(data) {
      tableHead.innerHTML = '';
      tableBody.innerHTML = '';
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer); // Clear previous markers
      });
  
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
          const th = document.createElement('th');
          th.textContent = header.charAt(0).toUpperCase() + header.slice(1);
          tableHead.appendChild(th);
        });
  
        markerGroups = {};
  
        data.forEach(coord => {
          const { latitude, longitude } = coord;
          const key = `${latitude},${longitude}`;
  
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
  
        Object.keys(markerGroups).forEach(key => {
          const [lat, long] = key.split(',').map(Number);
          const markersData = markerGroups[key];
          const marker = L.marker([lat, long]).addTo(map);
  
          marker.on('click', function() {
            let details = '';
            markersData.forEach(coord => {
              details += '<strong>Details:</strong><br>';
              headers.forEach(header => {
                details += `${header.charAt(0).toUpperCase() + header.slice(1)}: ${coord[header]}<br>`;
              });
              details += '<br>';
            });
  
            popup.setContent(details);
            popup.setLatLng([lat, long]);
            popup.openOn(map);
          });
        });
      }
    }
  
    window.applyFilters = function () {
      const courtNameFilter = document.getElementById('courtNameFilter').value.toLowerCase();
      const courtDepartmentFilter = document.getElementById('courtDepartmentFilter').value.toLowerCase();
  
      const filteredData = originalData.filter(coord => {
        const courtNameMatch = coord.courtName.toLowerCase().includes(courtNameFilter);
        const courtDepartmentMatch = coord.courtDepartment.toLowerCase().includes(courtDepartmentFilter);
        return courtNameMatch && courtDepartmentMatch;
      });
  
      populateTableAndMap(filteredData); // Repopulate table and map with filtered data
    };
  });
  