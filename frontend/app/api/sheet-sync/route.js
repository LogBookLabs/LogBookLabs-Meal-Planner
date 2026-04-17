import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const CREDS_PATH = path.join(process.env.USERPROFILE || '/root', '.openclaw', 'secrets', 'trill-sheets-service-account.json');
const SHEET_ID = '13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI';

const DAY_ROWS = { Monday: 2, Tuesday: 4, Wednesday: 6, Thursday: 8, Friday: 10, Saturday: 12, Sunday: 14 };
const MEAL_COLS_W1 = { Breakfast: 'C', Lunch: 'D', Dinner: 'E', Snacks: 'F' };
const MEAL_COLS_W2 = { Breakfast: 'H', Lunch: 'I', Dinner: 'J', Snacks: 'K' };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function POST(request) {
  try {
    const { week1MealPlan, week2MealPlan } = await request.json();
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Batch write all meals for both weeks
    const allUpdates = [];

    if (week1MealPlan) {
      for (const day of DAYS) {
        for (const meal of MEALS) {
          const recipeName = week1MealPlan[day]?.[meal] || '';
          if (!recipeName) continue;
          const row = DAY_ROWS[day];
          const col = MEAL_COLS_W1[meal];
          allUpdates.push({
            spreadsheetId: SHEET_ID,
            range: `planner!${col}${row}:${col}${row}`,
            resource: { values: [[recipeName]] },
          });
        }
      }
    }

    if (week2MealPlan) {
      for (const day of DAYS) {
        for (const meal of MEALS) {
          const recipeName = week2MealPlan[day]?.[meal] || '';
          if (!recipeName) continue;
          const row = DAY_ROWS[day];
          const col = MEAL_COLS_W2[meal];
          allUpdates.push({
            spreadsheetId: SHEET_ID,
            range: `planner!${col}${row}:${col}${row}`,
            resource: { values: [[recipeName]] },
          });
        }
      }
    }

    // Execute all updates in parallel
    await Promise.all(allUpdates.map(u =>
      sheets.spreadsheets.values.update({
        ...u,
        valueInputOption: 'USER_ENTERED',
      })
    ));

    return NextResponse.json({ syncedMeals: allUpdates.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
