/**
 * Meal Planner Pro — Apps Script Setup
 * Paste this into Extensions → Apps Script in your Google Sheet template.
 * Creates a menu: ⚡ Meal Planner Pro → Connect to App (one click)
 */

const SERVICE_ACCOUNT_EMAIL = 'trill-sheets-access@trill-hmi.iam.gserviceaccount.com';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ Meal Planner Pro')
    .addItem('⚡ Connect to App', 'connectSheetToServiceAccount')
    .addSeparator()
    .addItem('📋 How it works', 'showHowItWorks')
    .addToUi();
}

function connectSheetToServiceAccount() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetId = ss.getId();
  try {
    Drive.Permissions.insert(
      { role: 'writer', type: 'user', value: SERVICE_ACCOUNT_EMAIL },
      sheetId,
      { sendNotificationEmails: false }
    );
    PropertiesService.getScriptProperties().setProperties({
      connected: 'true',
      sheetId: sheetId,
      connectedAt: new Date().toISOString()
    });
    SpreadsheetApp.getUi().alert(
      '✅ Connected!',
      'Your sheet is linked to Meal Planner Pro. Paste your sheet URL in the web app and you\'re done!',
      SpreadsheetApp.getUi().Button.OK
    );
  } catch (err) {
    SpreadsheetApp.getUi().alert('⚠️ Couldn\'t connect', 'Error: ' + err.message, SpreadsheetApp.getUi().Button.OK);
  }
}

function showHowItWorks() {
  SpreadsheetApp.getUi().alert(
    '📋 How it works',
    '1. Click ⚡ Connect to App\n2. Click Run / Grant permission (one-time)\n3. Paste your sheet URL in the web app — done!\n\nYour data stays in your Google Drive.',
    SpreadsheetApp.getUi().Button.OK
  );
}

function checkConnectionStatus() {
  const p = PropertiesService.getScriptProperties();
  return {
    connected: p.getProperty('connected') === 'true',
    sheetId: p.getProperty('sheetId'),
    connectedAt: p.getProperty('connectedAt')
  };
}