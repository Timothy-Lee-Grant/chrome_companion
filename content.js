// content.js - Injects the screen buddy into the page

// Create the buddy element (placeholder div for now)
const buddy = document.createElement('div');
buddy.id = 'screen-buddy';
buddy.className = 'buddy';

// Inject into the document body
document.body.appendChild(buddy);

// The buddy is now on the page with styles applied via styles.css