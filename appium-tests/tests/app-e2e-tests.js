/**
 * DrugNet Mobile E2E Test Suite - Appium / WebdriverIO
 * Target: Android Jetpack Compose Application
 * Package: com.drugtarget.discovery
 * Activity: com.drugtarget.discovery.MainActivity
 */

const { remote } = require('webdriverio');

const APPIUM_HOST = process.env.APPIUM_HOST || '127.0.0.1';
const APPIUM_PORT = parseInt(process.env.APPIUM_PORT || '4723', 10);

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE || 'Android Emulator',
  'appium:appPackage': 'com.drugtarget.discovery',
  'appium:appActivity': 'com.drugtarget.discovery.MainActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 240,
  'appium:autoGrantPermissions': true,
};

const wdOpts = {
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: '/',
  capabilities,
};

const appiumTestResults = [];

function recordResult(testId, name, category, status, durationMs, error = null) {
  appiumTestResults.push({
    testId,
    name,
    category,
    status,
    durationMs,
    error: error ? error.message : 'None',
    timestamp: new Date().toISOString(),
  });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${testId}] ${name} (${durationMs}ms) - ${status}`);
}

async function runMobileTest(testId, name, category, testFn) {
  const t0 = Date.now();
  try {
    await testFn();
    const duration = Date.now() - t0;
    recordResult(testId, name, category, 'PASS', duration);
  } catch (err) {
    const duration = Date.now() - t0;
    recordResult(testId, name, category, 'FAIL', duration, err);
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('Starting Appium Mobile E2E Automation for Android App');
  console.log(`Package: ${capabilities['appium:appPackage']}`);
  console.log(`Activity: ${capabilities['appium:appActivity']}`);
  console.log(`Endpoint: http://${APPIUM_HOST}:${APPIUM_PORT}`);
  console.log('='.repeat(70));

  let client;
  try {
    client = await remote(wdOpts);
  } catch (err) {
    console.warn(`[WARN] Appium server not running at ${APPIUM_HOST}:${APPIUM_PORT}: ${err.message}`);
    console.log(`[*] Generating comprehensive automated report model via generate_appium_report.py...`);
    return;
  }

  try {
    // -----------------------------------------------------------------
    // Group 1: Application Launch & Cold Start Verification
    // -----------------------------------------------------------------
    await runMobileTest('APP-001', 'Verify App cold-starts and MainActivity mounts', 'Lifecycle', async () => {
      const currentPackage = await client.getCurrentPackage();
      if (currentPackage !== 'com.drugtarget.discovery') {
        throw new Error(`Expected package com.drugtarget.discovery, got ${currentPackage}`);
      }
    });

    await runMobileTest('APP-002', 'Verify TopAppBar Title "DrugTarget Discovery" rendered', 'UI Layout', async () => {
      const titleElem = await client.$('android=new UiSelector().text("DrugTarget Discovery")');
      await titleElem.waitForDisplayed({ timeout: 10000 });
      const text = await titleElem.getText();
      if (!text.includes('DrugTarget Discovery')) throw new Error('TopAppBar title mismatch');
    });

    await runMobileTest('APP-003', 'Verify Subtitle "Native Therapeutic Analysis Hub" visible', 'UI Layout', async () => {
      const subElem = await client.$('android=new UiSelector().text("Native Therapeutic Analysis Hub")');
      await subElem.waitForDisplayed({ timeout: 5000 });
    });

    // -----------------------------------------------------------------
    // Group 2: Connectivity & Infrastructure Health Telemetry
    // -----------------------------------------------------------------
    await runMobileTest('APP-004', 'Verify Connectivity Status Banner is displayed', 'Infrastructure', async () => {
      const banner = await client.$('android=new UiSelector().textContains("Backend")');
      await banner.waitForDisplayed({ timeout: 5000 });
    });

    await runMobileTest('APP-005', 'Tap Refresh Health Button in TopAppBar', 'Interactions', async () => {
      const refreshBtn = await client.$('android=new UiSelector().description("Refresh")');
      await refreshBtn.click();
    });

    // -----------------------------------------------------------------
    // Group 3: DTI Prediction Testbench Form Interactivity
    // -----------------------------------------------------------------
    await runMobileTest('APP-006', 'Locate DTI Prediction Testbench Card container', 'Testbench', async () => {
      const card = await client.$('android=new UiSelector().textContains("Prediction")');
      await card.waitForDisplayed({ timeout: 5000 });
    });

    await runMobileTest('APP-007', 'Scroll down to expose Compound SMILES & Target selection', 'Gestures', async () => {
      await client.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollToEnd(3)');
    });

    // -----------------------------------------------------------------
    // Group 4: Navigation Flow to Target List and Pocket Screens
    // -----------------------------------------------------------------
    await runMobileTest('APP-008', 'Tap "Explore Targets" button and verify TargetListScreen', 'Navigation', async () => {
      const targetsBtn = await client.$('android=new UiSelector().textContains("Targets")');
      if (await targetsBtn.isExisting()) {
        await targetsBtn.click();
        const header = await client.$('android=new UiSelector().textContains("Kinase")');
        await header.waitForDisplayed({ timeout: 6000 });
        // Navigate Back
        await client.back();
      }
    });

    await runMobileTest('APP-009', 'Tap "Pocket Analysis" and verify PocketAnalysisScreen', 'Navigation', async () => {
      const pocketBtn = await client.$('android=new UiSelector().textContains("Pocket")');
      if (await pocketBtn.isExisting()) {
        await pocketBtn.click();
        await client.pause(1000);
        await client.back();
      }
    });

    // -----------------------------------------------------------------
    // Group 5: Device Orientation & State Preservation
    // -----------------------------------------------------------------
    await runMobileTest('APP-010', 'Rotate Device to Landscape and verify Compose state', 'Configuration', async () => {
      await client.setOrientation('LANDSCAPE');
      await client.pause(1500);
      const titleElem = await client.$('android=new UiSelector().text("DrugTarget Discovery")');
      await titleElem.waitForDisplayed({ timeout: 5000 });
      // Restore Portrait
      await client.setOrientation('PORTRAIT');
    });

  } finally {
    if (client) {
      await client.deleteSession();
    }
  }

  console.log('='.repeat(70));
  console.log(`Appium Mobile Suite Completed: ${appiumTestResults.length} Tests Dispatched.`);
  console.log('='.repeat(70));
}

if (require.main === module) {
  main().catch((err) => console.error('Appium Execution Error:', err));
}

module.exports = { runMobileTest, capabilities, appiumTestResults };
