/**
 * WhatsApp Floating Chat Widget & Visitor Notification System
 * Portfolio: Rishabh Dhar Dwivedi
 */

document.addEventListener("DOMContentLoaded", function () {
    // ---------------------------------------------------------
    // 1. FLOATING CHAT BUBBLE LOGIC
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

    // ---------------------------------------------------------
    // 2. VISITOR ALERT NOTIFICATION LOGIC
    // ---------------------------------------------------------
    sendVisitorNotification();
});

async function sendVisitorNotification() {
    // Avoid duplicate notifications in the same browsing session
    if (sessionStorage.getItem("portfolio_visitor_alert_sent")) {
        return;
    }

    let locationInfo = "India";
    try {
        const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (res.ok) {
            const data = await res.json();
            const parts = [data.city, data.region, data.country_name].filter(Boolean);
            if (parts.length > 0) {
                locationInfo = parts.join(", ");
            }
        }
    } catch (e) {
        // Silent fallback
    }

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? "Mobile 📱" : "Desktop/Laptop 💻";
    const timeString = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // 1. Send Email Notification to Gmail (via FormSubmit AJAX)
    const targetEmail = (typeof mySecrets !== "undefined" && mySecrets.ALERT_EMAIL) 
        ? mySecrets.ALERT_EMAIL 
        : "dwivedirishabh72@gmail.com";

    if (targetEmail) {
        const emailPayload = {
            _subject: `🚀 New Portfolio Visitor! [${locationInfo}]`,
            _captcha: "false",
            _template: "table",
            "Visitor Location": locationInfo,
            "Visit Time": timeString,
            "Device Type": deviceType,
            "Page Viewed": window.location.href,
            "Screen Size": `${window.screen.width} x ${window.screen.height}`
        };

        fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(emailPayload)
        }).catch(function () {});
    }

    // 2. Send via CallMeBot (WhatsApp) if configured
    const hasCallMeBot = typeof mySecrets !== "undefined" && mySecrets.CALLMEBOT_API_KEY && mySecrets.CALLMEBOT_API_KEY.trim() !== "";
    if (hasCallMeBot) {
        const messageText = 
            `🚀 *New Visitor on your Portfolio!* 🚀\n\n` +
            `📍 *Location:* ${locationInfo}\n` +
            `⏰ *Time:* ${timeString}\n` +
            `🖥️ *Device:* ${deviceType}\n` +
            `🌐 *Page:* ${window.location.href}`;

        const phone = mySecrets.CALLMEBOT_PHONE || "918470977210";
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(messageText)}&apikey=${mySecrets.CALLMEBOT_API_KEY}`;
        fetch(url, { mode: "no-cors" }).catch(function () {});
    }

    // 3. Send via Telegram if configured
    const hasTelegram = typeof mySecrets !== "undefined" && mySecrets.TELEGRAM_BOT_TOKEN && mySecrets.TELEGRAM_CHAT_ID && mySecrets.TELEGRAM_BOT_TOKEN.trim() !== "";
    if (hasTelegram) {
        const messageText = 
            `🚀 *New Visitor on your Portfolio!* 🚀\n\n` +
            `📍 *Location:* ${locationInfo}\n` +
            `⏰ *Time:* ${timeString}\n` +
            `🖥️ *Device:* ${deviceType}\n` +
            `🌐 *Page:* ${window.location.href}`;

        const tgUrl = `https://api.telegram.org/bot${mySecrets.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${mySecrets.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(messageText)}&parse_mode=Markdown`;
        fetch(tgUrl).catch(function () {});
    }

    // Mark as sent for this session so we don't spam on refresh
    sessionStorage.setItem("portfolio_visitor_alert_sent", "true");
}
