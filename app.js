document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([52.237, 19.015], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const table = document.getElementById('coordinates-table');
    const tableHead = table.querySelector('thead tr');
    const tableBody = table.querySelector('tbody');
    const popup = L.popup();
    let originalData = [];
    let markerGroups = {};

    // Function to load JSON based on file selection
    function loadJSON(filename) {
        fetch(filename)
            .then(response => response.json())
            .then(data => {
                originalData = data;
                populateTableAndMap(data);
            })
            .catch(error => console.error('Error loading JSON:', error));
    }

    // Populate map and table
    function populateTableAndMap(data) {
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        if (data.length > 0) {
            const headers = Object.keys(data[0]).filter(header => header !== 'latitude' && header !== 'longitude');
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

                marker.on('click', function () {
                    let details = '<div class="scrollable-popup">';
                    markersData.forEach(coord => {
                        details += '<strong>Details:</strong><br>';
                        headers.forEach(header => {
                            details += `${header.charAt(0).toUpperCase() + header.slice(1)}: ${coord[header]}<br>`;
                        });
                        details += '<br>';
                    });
                    details += '</div>';

                    popup.setContent(details);
                    popup.setLatLng([lat, long]);
                    popup.openOn(map);
                });
            });
        }
    }

    // Event listener for dropdown
    document.getElementById('jsonSelector').addEventListener('change', function (event) {
        loadJSON(event.target.value);
    });

    // Load default dataset
    loadJSON('coordinates_2023.json');
});
