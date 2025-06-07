// This file contains utilities for debugging Blazor WebAssembly applications
window.debugHelpers = {
    // This function forces a breakpoint in JavaScript
    breakHere: function() {
        console.log("BLAZOR DEBUG: Breakpoint triggered if pause on debugger is enabled");
        debugger;
    },

    // This function logs a message to the console
    log: function(message) {
        console.log("BLAZOR DEBUG: ", message);
    },

    // This function helps test if Blazor interop is working correctly
    testInterop: function(dotNetInstance) {
        console.log("JavaScript called from .NET");
        dotNetInstance.invokeMethodAsync('CallbackFromJS', 'Success! JS Interop is working');
        return "JS interop test complete";
    },
    
    // Get detailed device information for debugging
    getDeviceDetails: function() {
        const info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            online: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            memory: window.performance && window.performance.memory ? 
                    window.performance.memory : 'Not available',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            colorDepth: window.screen.colorDepth,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        };
        
        console.log("Device Details:", info);
        return info;
    }
};

// Browser Services - Functions requiring user permissions
window.browserServices = {
    // Location Services
    getLocation: function() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                resolve({
                    available: false,
                    status: "not-supported",
                    error: "Geolocation API not supported in this browser"
                });
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        available: true,
                        status: "granted",
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date(position.timestamp).toISOString()
                    });
                },
                error => {
                    let errorMessage = "Unknown error";
                    let status = "error";
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location permission denied by user";
                            status = "denied";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information unavailable";
                            status = "unavailable";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Location request timed out";
                            status = "timeout";
                            break;
                    }
                    
                    resolve({
                        available: true,
                        status: status,
                        error: errorMessage,
                        errorCode: error.code
                    });
                }
            );
        });
    },
    
    // Notification API
    checkNotifications: function() {
        if (!("Notification" in window)) {
            return {
                available: false,
                status: "not-supported"
            };
        }
        
        return {
            available: true,
            status: Notification.permission
        };
    },
    
    requestNotificationPermission: async function() {
        if (!("Notification" in window)) {
            return {
                available: false,
                status: "not-supported"
            };
        }
        
        try {
            const permission = await Notification.requestPermission();
            return {
                available: true,
                status: permission
            };
        } catch (error) {
            return {
                available: true,
                status: "error",
                error: error.message
            };
        }
    },
    
    // Media Devices (Camera/Microphone)
    checkMediaDevices: function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return {
                available: false,
                status: "not-supported"
            };
        }
        
        return {
            available: true,
            status: "available"
        };
    },
    
    requestCameraPermission: async function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return {
                available: false,
                status: "not-supported"
            };
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Stop tracks to release camera
            stream.getTracks().forEach(track => track.stop());
            return {
                available: true,
                status: "granted"
            };
        } catch (error) {
            let status = "error";
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                status = "denied";
            } else if (error.name === "NotFoundError") {
                status = "unavailable";  // No camera hardware
            }
            
            return {
                available: true,
                status: status,
                error: error.message,
                errorName: error.name
            };
        }
    },
    
    requestMicrophonePermission: async function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return {
                available: false,
                status: "not-supported"
            };
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
            return {
                available: true,
                status: "granted"
            };
        } catch (error) {
            let status = "error";
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                status = "denied";
            } else if (error.name === "NotFoundError") {
                status = "unavailable";  // No microphone hardware
            }
            
            return {
                available: true,
                status: status,
                error: error.message,
                errorName: error.name
            };
        }
    },
    
    // Clipboard API
    checkClipboardApi: function() {
        return {
            available: navigator.clipboard !== undefined,
            readAvailable: navigator.clipboard && navigator.clipboard.readText !== undefined,
            writeAvailable: navigator.clipboard && navigator.clipboard.writeText !== undefined
        };
    },
    
    writeToClipboard: async function(text) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            return {
                success: false,
                error: "Clipboard write API not supported"
            };
        }
        
        try {
            await navigator.clipboard.writeText(text);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Battery Status API
    checkBatteryStatus: async function() {
        if (!navigator.getBattery) {
            return {
                available: false,
                status: "not-supported"
            };
        }
        
        try {
            const battery = await navigator.getBattery();
            return {
                available: true,
                status: "supported",
                level: battery.level * 100,
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
            };
        } catch (error) {
            return {
                available: false,
                status: "error",
                error: error.message
            };
        }
    },
    
    // Sensor APIs
    checkDeviceOrientation: function() {
        return {
            available: window.DeviceOrientationEvent !== undefined
        };
    },
    
    checkDeviceMotion: function() {
        return {
            available: window.DeviceMotionEvent !== undefined
        };
    },
    
    // Check browser storage
    checkStorageAvailability: function() {
        const testLocalStorage = () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        };
        
        const testSessionStorage = () => {
            try {
                sessionStorage.setItem('test', 'test');
                sessionStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        };
        
        const testIndexedDB = () => {
            try {
                return !!window.indexedDB;
            } catch (e) {
                return false;
            }
        };
        
        return {
            localStorage: {
                available: typeof localStorage !== 'undefined',
                working: testLocalStorage(),
                size: calculateStorageSize('localStorage')
            },
            sessionStorage: {
                available: typeof sessionStorage !== 'undefined',
                working: testSessionStorage(),
                size: calculateStorageSize('sessionStorage')
            },
            indexedDB: {
                available: testIndexedDB()
            },
            cookies: {
                available: navigator.cookieEnabled
            }
        };
    }
};

// Helper function to estimate storage usage
function calculateStorageSize(type) {
    if ((type !== 'localStorage' && type !== 'sessionStorage') || 
        typeof window[type] === 'undefined') {
        return 'unknown';
    }
    
    try {
        const storage = window[type];
        let totalSize = 0;
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            const value = storage.getItem(key);
            totalSize += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
        }
        
        // Format size
        if (totalSize < 1024) {
            return `${totalSize} bytes`;
        } else if (totalSize < 1024 * 1024) {
            return `${(totalSize / 1024).toFixed(2)} KB`;
        } else {
            return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
        }
    } catch (e) {
        return 'calculation error';
    }
}

// Function to get browser information and update UI elements
window.getBrowserInfo = function() {
    // Get browser details using the navigator object
    const userAgent = navigator.userAgent;
    const browserInfo = detectBrowser(userAgent);
    
    // Get additional browser information
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const cookiesEnabled = navigator.cookieEnabled;
    
    // Update the UI elements
    document.getElementById('browserInfo').textContent = browserInfo.name;
    document.getElementById('browserVersion').textContent = browserInfo.version;
    document.getElementById('userAgent').textContent = userAgent;
    document.getElementById('windowSize').textContent = `${windowWidth}×${windowHeight}`;
    document.getElementById('screenResolution').textContent = `${screenWidth}×${screenHeight}`;
    document.getElementById('cookiesEnabled').textContent = cookiesEnabled ? 'Yes' : 'No';
    
    console.log("Browser detection complete: ", browserInfo);
    
    return browserInfo;
};

// Helper function to detect browser name and version from user agent
function detectBrowser(userAgent) {
    // Define patterns for common browsers
    const browsers = [
        {name: "Edge", pattern: /(edg|edge)/i},
        {name: "Chrome", pattern: /(chrome|chromium)/i},
        {name: "Firefox", pattern: /(firefox|fxios)/i},
        {name: "Safari", pattern: /(safari)/i},
        {name: "Opera", pattern: /(opera|opr)/i},
        {name: "Internet Explorer", pattern: /(msie|trident)/i}
    ];
    
    // Default values
    let browser = {
        name: "Unknown",
        version: "Unknown"
    };
    
    // Test each browser pattern
    for (const b of browsers) {
        if (b.pattern.test(userAgent)) {
            browser.name = b.name;
            break;
        }
    }
    
    // Extract version based on browser
    let versionMatch;
    switch (browser.name) {
        case "Chrome":
            versionMatch = userAgent.match(/(?:chrome|chromium)\/([0-9.]+)/i);
            break;
        case "Firefox":
            versionMatch = userAgent.match(/(?:firefox|fxios)\/([0-9.]+)/i);
            break;
        case "Edge":
            versionMatch = userAgent.match(/(?:edge|edg)\/([0-9.]+)/i);
            break;
        case "Opera":
            versionMatch = userAgent.match(/(?:opera|opr)\/([0-9.]+)/i);
            break;
        case "Safari":
            // Safari's version is typically after "Version/"
            versionMatch = userAgent.match(/version\/([0-9.]+)/i);
            break;
        case "Internet Explorer":
            versionMatch = userAgent.match(/(?:msie |rv:)([0-9.]+)/i);
            break;
    }
    
    if (versionMatch && versionMatch[1]) {
        browser.version = versionMatch[1];
    }
    
    return browser;
}

// Alert that debug helpers are loaded
console.log("Blazor Debug Helpers loaded");
