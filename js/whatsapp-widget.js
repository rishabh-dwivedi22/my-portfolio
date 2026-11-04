/**
 * WhatsApp Floating Chat Widget
 * Portfolio: Rishabh Dhar Dwivedi
 */

document.addEventListener("DOMContentLoaded", function () {
    // ---------------------------------------------------------
    // FLOATING CHAT BUBBLE LOGIC
    // ---------------------------------------------------------
    const bubble = document.getElementById("waChatBubble");
    const closeBtn = document.getElementById("waCloseBubble");

    // Automatically show bubble after 3.5 seconds
    if (bubble) {
        setTimeout(function () {
            // Check if user dismissed it in this session
            if (!sessionStorage.getItem("wa_bubble_dismissed")) {
                bubble.classList.add("show");
            }
        }, 3500);

        if (closeBtn) {
            closeBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                bubble.classList.remove("show");
                sessionStorage.setItem("wa_bubble_dismissed", "true");
            });
        }

        // Clicking the bubble opens the WhatsApp chat
        bubble.addEventListener("click", function () {
            const waBtn = document.getElementById("waButton");
            if (waBtn) {
                waBtn.click();
            }
        });
    }
});
