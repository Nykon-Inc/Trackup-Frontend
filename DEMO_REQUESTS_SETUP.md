# Google Sheets setup for Watchtower demo requests

The application is ready to append each successful `/request-demo` submission to a Google Sheet through the server-only `/api/demo-requests` endpoint.

## 1. Create the spreadsheet

Create a Google Sheet named **Watchtower Demo Requests**. Rename its first tab to **Demo Requests**.

Place these headings in row 1, columns A through J:

| Submitted At | Work Email | Company Size | First Name | Last Name | Company Name | Job Title | Country/Region | Phone | Marketing Consent |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 2. Share it with the application

Share the spreadsheet with the following service account and grant **Editor** access:

`p400-327@p400-project-454221.iam.gserviceaccount.com`

This is an application identity, not an inbox. Do not try to sign into Gmail with it.

## 3. Enable the Google Sheets API

In Google Cloud Console, select project `p400-project-454221`, open **APIs & Services → Library**, find **Google Sheets API**, and select **Enable**.

## 4. Configure the spreadsheet ID

Copy the ID from the spreadsheet URL:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

For local development, paste only that ID after `GOOGLE_SHEET_ID=` in `.env.local`. The local file already points to the protected service-account credential outside this repository.

Restart the development server after changing environment variables.

## 5. Configure production secrets

In the hosting provider, create these server-side environment variables:

- `GOOGLE_SHEET_ID`: the spreadsheet ID
- `GOOGLE_SHEET_TAB`: `Demo Requests`
- `GOOGLE_CLIENT_EMAIL`: `p400-327@p400-project-454221.iam.gserviceaccount.com`
- `GOOGLE_PRIVATE_KEY`: the complete `private_key` value from the service-account JSON

Preserve the private key's line breaks. If the provider stores it on one line, use literal `\n` sequences; the application converts them when it starts.

Never add `NEXT_PUBLIC_` to credential variables. Never upload the JSON credential into the public application directory or source control.

## 6. Test

After restarting or redeploying, complete `/request-demo` with test details. A new row should appear in the **Demo Requests** tab, and the website should show its confirmation screen only after Google accepts the row.

If the website reports that it could not save the request, verify:

1. Google Sheets API is enabled in `p400-project-454221`.
2. The spreadsheet was shared with the exact service-account email as Editor.
3. `GOOGLE_SHEET_ID` contains only the ID, not the full URL.
4. The tab is named exactly `Demo Requests`, or `GOOGLE_SHEET_TAB` matches its actual name.
5. The private key is complete and has intact line breaks.

## Credential safety

The local credential file has been restricted to the current operating-system user (`chmod 600`). If the file was ever committed, emailed, pasted into chat, or otherwise exposed, rotate the key in Google Cloud before production use.
