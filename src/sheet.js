const SPREADSHEET_ID = "1M9a_kIKegQyVCBN8-XTKMvg2cgloNl_Ue31rsDNUOtc";
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;
const COLUMNS = ["name", "ownerTeam", "description", "status", "cost"];

export async function loadTools() {
  const response = await fetch(SHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(
      `Could not read the internal tools sheet (${response.status}). In Google Sheets, set General access to "Anyone with the link" as Viewer.`,
    );
  }

  const text = (await response.text()).replace(/^\uFEFF/, "");
  return toolsFromCsv(text);
}

function toolsFromCsv(text) {
  const rows = parseCsv(text);
  const header = rows[0];
  if (!header) {
    throw new Error("The internal tools sheet is empty.");
  }

  for (const column of COLUMNS) {
    if (!header.includes(column)) {
      throw new Error(`The internal tools sheet is missing a "${column}" column.`);
    }
  }

  return rows.slice(1).filter((row) => row.some((cell) => cell.trim() !== "")).map((row) => {
    const tool = {};
    for (const column of COLUMNS) {
      tool[column] = row[header.indexOf(column)] ?? "";
    }
    return tool;
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell !== "")) rows.push(row);
  }

  return rows;
}
