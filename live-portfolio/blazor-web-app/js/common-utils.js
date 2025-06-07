// Common JavaScript utilities for both Web and MAUI projects

window.commonUtils = {
    // Scrolls to an element by ID with gentle animation
    // Works in both web browsers and WebView in MAUI
    scrollToElementById: function (elementId, behavior = 'smooth') {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                // Check if the element is visible in the DOM
                if (element.getBoundingClientRect().height > 0) {
                    // Use scrollIntoView with behavior option for smooth scrolling
                    element.scrollIntoView({ 
                        behavior: behavior,
                        block: 'start'
                    });
                    return true;
                }
            }
            
            // Fallback if element not found or not visible
            // Gently scroll to the top of the page
            window.scrollTo({ 
                top: 0,
                behavior: behavior
            });
            
            return true;
        } catch (error) {
            console.error("Error in scrollToElementById:", error);
            
            // Final fallback - simple scroll to top
            try {
                window.scrollTo(0, 0);
            } catch {
                // Silently fail if even the basic scroll fails
            }
            
            return false;
        }
    }
};
