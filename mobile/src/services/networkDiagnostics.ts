/**
 * Network Diagnostics Utility
 * Test R2 connectivity using FileSystem (more reliable than fetch in RN)
 */

import * as FileSystem from "expo-file-system";

/**
 * Test R2 domain accessibility by attempting actual download
 */
export async function testR2DnsResolution(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  const r2TestUrl =
    "https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev/dark-atmosphere-with-rain-352570.mp3";
  const results: any = {};

  try {
    console.log("Testing R2 domain with actual download attempt...");
    const tempUri =
      FileSystem.cacheDirectory + "r2_test_" + Date.now() + ".tmp";

    const download = FileSystem.createDownloadResumable(
      r2TestUrl,
      tempUri,
      {},
      () => {}, // Progress callback
    );

    // Try to download with 10 second timeout
    const result: any = await Promise.race([
      download.downloadAsync(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000),
      ),
    ]);

    if (result) {
      results[r2TestUrl] = { success: true };
      console.log(`✅ R2 domain is accessible`);

      // Clean up test file
      try {
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      } catch (e) {
        // Ignore cleanup errors
      }

      return {
        success: true,
        details: results,
      };
    }
  } catch (error: any) {
    results[r2TestUrl] = {
      success: false,
      error: error.message,
    };

    console.error(`❌ R2 test failed:`, error.message);

    // Detect specific error types
    const errorMsg = error.message || "";

    if (
      errorMsg.includes("No address associated with hostname") ||
      errorMsg.includes("Unable to resolve host")
    ) {
      console.error("  ➡️ DNS Resolution Failed");
      return {
        success: false,
        error:
          "🔴 DNS RESOLUTION FAILED\n\n" +
          "R2 domain cannot be resolved to an IP address.\n\n" +
          "MOST LIKELY CAUSE:\n" +
          "→ R2 bucket is NOT PUBLIC (90% chance)\n\n" +
          "OTHER POSSIBILITIES:\n" +
          "→ DNS not propagated (if setup today)\n" +
          "→ Network blocking R2 domains\n\n" +
          "IMMEDIATE ACTION REQUIRED:\n" +
          "1. Open Cloudflare Dashboard\n" +
          "2. Go to R2 → Your Bucket\n" +
          "3. Settings → Public Access → Enable\n" +
          "4. Test URL in phone browser",
        details: results,
      };
    } else if (errorMsg.includes("Network request failed")) {
      console.error("  ➡️ Network blocked or offline");
      return {
        success: false,
        error:
          "🔴 NETWORK ISSUE\n\n" +
          "Cannot make HTTPS requests.\n\n" +
          "POSSIBLE CAUSES:\n" +
          "→ No internet connection\n" +
          "→ Firewall blocking app\n" +
          "→ Corporate/school restrictions\n\n" +
          "TRY THIS:\n" +
          "→ Switch to mobile data\n" +
          "→ Try different WiFi\n" +
          "→ Check other apps work",
        details: results,
      };
    } else if (errorMsg.includes("Timeout") || errorMsg.includes("timeout")) {
      console.error("  ➡️ Request timed out");
      return {
        success: false,
        error:
          "⏱️ CONNECTION TIMEOUT\n\n" +
          "Request took too long.\n\n" +
          "TRY THIS:\n" +
          "→ Check internet speed\n" +
          "→ Try again in better network\n" +
          "→ R2 might be slow/overloaded",
        details: results,
      };
    }

    // Unknown error
    return {
      success: false,
      error: `Unknown error: ${errorMsg}`,
      details: results,
    };
  }

  return {
    success: false,
    error: "Unexpected error during R2 test",
    details: results,
  };
}

/**
 * Run simplified network diagnostics
 */
export async function runNetworkDiagnostics(): Promise<{
  internetOk: boolean;
  r2DnsOk: boolean;
  r2Reachable: boolean;
  recommendations: string[];
}> {
  console.log("\n🔍 Running Network Diagnostics...\n");

  // Test R2 directly (most reliable)
  const dnsTest = await testR2DnsResolution();
  const r2DnsOk = dnsTest.success;
  const r2Reachable = dnsTest.success;

  // If R2 works, internet must be OK
  const internetOk = r2DnsOk;

  // Generate recommendations
  const recommendations: string[] = [];

  if (!r2DnsOk && dnsTest.error) {
    // Use the detailed error from testR2DnsResolution
    recommendations.push(dnsTest.error);
  } else if (!r2DnsOk) {
    recommendations.push("❌ R2 domain cannot be accessed");
    recommendations.push("");
    recommendations.push("MOST LIKELY FIX:");
    recommendations.push("→ Enable R2 bucket public access in Cloudflare");
  } else {
    recommendations.push("✅ R2 is accessible!");
    recommendations.push("Audio downloads should work");
  }

  console.log("\n📋 Diagnosis:");
  recommendations.forEach((rec) => {
    console.log(rec);
  });
  console.log("");

  return {
    internetOk,
    r2DnsOk,
    r2Reachable,
    recommendations,
  };
}
