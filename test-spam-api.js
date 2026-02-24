/**
 * test-spam-api.js
 * 
 * Auto-validation script to test the /api/send-email backend endpoint 
 * for its spam-prevention capabilities.
 * 
 * Usage:
 * 1. Start your local server (e.g., npx vercel dev -y)
 * 2. Run this script in another terminal: node test-spam-api.js
 */

const API_URL = "http://localhost:3000/api/send-email"; // Adjust port if Vercel picks 3001, etc.

async function sendTest(name, payload, expectedStatus) {
    console.log(`\n--- Running Test: ${name} ---`);
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.text();
        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            parsed = data;
        }

        if (response.status === expectedStatus) {
            console.log(`✅ Passed! Expected Status ${expectedStatus} matched.`);
            console.log(`Response:`, parsed);
        } else {
            console.error(`❌ Failed! Expected Status ${expectedStatus}, but got ${response.status}.`);
            console.error(`Response:`, parsed);
        }
    } catch (error) {
        console.error(`❌ Request failed:`, error.message);
    }
}

async function runAllTests() {
    console.log("Starting API Spam Protection Tests...");
    console.log(`Testing against endpoint: ${API_URL}`);

    // Test 1: Active Honeypot
    await sendTest(
        "Honeypot Triggered",
        {
            firstName: "Spam",
            lastName: "Bot",
            email: "spam@bot.com",
            website: "http://buy-my-stuff.com", // This should trigger silent drop (200 OK)
            mathChallenge: "7"
        },
        200 // We expect the server to fake a 200 OK so bots don't know they are blocked
    );

    // Test 2: Incorrect Math Challenge
    await sendTest(
        "Failed Math Validation",
        {
            firstName: "Spam",
            lastName: "Bot",
            email: "spam@bot.com",
            mathChallenge: "10" // Incorrect answer (expect 400 Bad Request)
        },
        400
    );

    // Test 3: URL Pattern in Name
    await sendTest(
        "URL in Name Field",
        {
            firstName: "Spam http://bot.net", // URL injected in name
            lastName: "Bot",
            email: "spam@bot.com",
            mathChallenge: "7"
        },
        400 // Expect 400 Bad Request
    );

    // Test 4: Missing Required Fields
    await sendTest(
        "Missing Email",
        {
            firstName: "Human",
            lastName: "Being",
            mathChallenge: "7"
        },
        400 // Expect 400 Bad Request
    );

    // NOTE: Test 5 (Valid Payload) is intentionally omitted to avoid actually
    // sending a ton of emails to your inbox every time you run the script.
    // The backend uses Resend which burns API quota for successful sends.

    console.log("\nTests Complete.\n");
}

runAllTests();
