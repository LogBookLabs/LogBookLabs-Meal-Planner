import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const CREDS_PATH = path.join(process.env.USERPROFILE || '/root', '.openclaw', 'secrets', 'trill-sheets-service-account.json');

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sheetId = searchParams.get('sheetId');
  const range = searchParams.get('range') || 'planner!A2:K15';

  if (!sheetId) {
    return NextResponse.json({ error: 'Missing sheetId' }, { status: 400 });
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    return NextResponse.json({ values: res.data.values || [] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
