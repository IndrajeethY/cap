#!/usr/bin/env node

/**
 * Test script to verify iframe configuration logic
 * This simulates the security header logic from auth.js
 */

function testSecurityHeaders(allowIframe, frameAncestors) {
    const headers = {};
    
    headers["X-Content-Type-Options"] = "nosniff";
    
    if (allowIframe && frameAncestors) {
        // Use CSP frame-ancestors for more granular control
        headers["Content-Security-Policy"] = `frame-ancestors ${frameAncestors}`;
    } else if (allowIframe) {
        // Allow all iframes if ALLOW_IFRAME is true but no specific ancestors defined
        // Note: When CSP is supported, omitting X-Frame-Options effectively allows framing
        // We set a permissive CSP instead
        headers["Content-Security-Policy"] = "frame-ancestors *";
    } else {
        // Default: deny all iframe embedding
        headers["X-Frame-Options"] = "DENY";
    }
    
    headers["X-XSS-Protection"] = "1; mode=block";
    
    return headers;
}

console.log("🧪 Testing iframe support configuration logic\n");

const testCases = [
    {
        name: "Default (iframe blocked)",
        allowIframe: false,
        frameAncestors: undefined,
        expectedHeaders: {
            "X-Frame-Options": "DENY"
        }
    },
    {
        name: "Allow iframe with specific ancestors (Telegram)",
        allowIframe: true,
        frameAncestors: "https://web.telegram.org https://telegram.org",
        expectedHeaders: {
            "Content-Security-Policy": "frame-ancestors https://web.telegram.org https://telegram.org"
        }
    },
    {
        name: "Allow iframe with wildcard",
        allowIframe: true,
        frameAncestors: "*",
        expectedHeaders: {
            "Content-Security-Policy": "frame-ancestors *"
        }
    },
    {
        name: "Allow iframe without specific ancestors",
        allowIframe: true,
        frameAncestors: undefined,
        expectedHeaders: {
            "Content-Security-Policy": "frame-ancestors *"
        }
    },
    {
        name: "Allow iframe with self only",
        allowIframe: true,
        frameAncestors: "'self'",
        expectedHeaders: {
            "Content-Security-Policy": "frame-ancestors 'self'"
        }
    }
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`  Input: ALLOW_IFRAME=${testCase.allowIframe}, FRAME_ANCESTORS=${testCase.frameAncestors || '(not set)'}`);
    
    const headers = testSecurityHeaders(testCase.allowIframe, testCase.frameAncestors);
    
    let passed = true;
    
    // Check expected headers
    for (const [key, value] of Object.entries(testCase.expectedHeaders)) {
        if (headers[key] !== value) {
            console.log(`  ❌ FAIL: Expected ${key}="${value}", got "${headers[key]}"`);
            passed = false;
            failedTests++;
        }
    }
    
    // Verify CSP and X-Frame-Options are mutually exclusive
    if (headers["Content-Security-Policy"] && headers["X-Frame-Options"]) {
        console.log(`  ❌ FAIL: Both CSP and X-Frame-Options are set (should be mutually exclusive)`);
        passed = false;
        failedTests++;
    }
    
    // Verify common headers are always present
    if (!headers["X-Content-Type-Options"]) {
        console.log(`  ❌ FAIL: X-Content-Type-Options not set`);
        passed = false;
        failedTests++;
    }
    
    if (!headers["X-XSS-Protection"]) {
        console.log(`  ❌ FAIL: X-XSS-Protection not set`);
        passed = false;
        failedTests++;
    }
    
    if (passed) {
        console.log(`  ✅ PASS`);
        passedTests++;
    }
    
    console.log(`  Headers set:`, JSON.stringify(headers, null, 2));
    console.log();
});

console.log("━".repeat(60));
console.log(`\n📊 Test Results: ${passedTests}/${testCases.length} passed, ${failedTests} failed\n`);

if (failedTests === 0) {
    console.log("✅ All tests passed!");
    process.exit(0);
} else {
    console.log("❌ Some tests failed");
    process.exit(1);
}
