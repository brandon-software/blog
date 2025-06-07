window.geolocationInterop = {
    getCurrentPosition: function () {
        return new Promise(function (resolve, reject) {
            if (!navigator.geolocation) {
                reject({
                    success: false,
                    error: "Geolocation is not supported by this browser."
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    resolve({
                        success: true,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed
                    });
                },
                function (error) {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "User denied the request for geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "The request to get user location timed out.";
                            break;
                        default:
                            errorMessage = "An unknown error occurred.";
                            break;
                    }
                    
                    reject({
                        success: false,
                        error: errorMessage
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },
    
    // Implement a basic reverse geocoding function using OpenStreetMap's Nominatim API
    getAddressFromLocation: function (latitude, longitude) {
        return new Promise(function (resolve, reject) {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
            
            fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BlazorGeolocationApp'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.display_name) {
                    resolve(data.display_name);
                } else {
                    reject('No address found for this location');
                }
            })
            .catch(error => {
                reject('Error fetching address: ' + error.message);
            });
        });
    }
};
