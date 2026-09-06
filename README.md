# CGC Campus Ride

Cleaned project copy. Unused backup/testing artifacts were removed; application source and Android project were kept.

## Backend

cd backend
pip install -r requirements.txt
python app.py

## Frontend / Android

cd front_end
npm install
npx cap sync android

Then open `front_end/android` in Android Studio or run `gradlew.bat assembleDebug` on Windows.

## Removed from this clean copy

- `backend_backup_working/` — duplicate backend backup
- audit/fix reports — documentation only
- `db_test.py` / `db_test.txt` — standalone database test artifacts
- `notif_harness.html` — notification test harness, not part of the app
- `front_end/android/local.properties` — machine-specific Android SDK path/configuration
