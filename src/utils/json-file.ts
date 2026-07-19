import { readFile, writeFile } from "node:fs/promises";

// Parse JSON that may contain comments and trailing commas (JSONC). `tsc --init`
// emits exactly this, so JSON.parse chokes on it. The scan is string-aware so a
// `//` or `,]` sequence inside a string value is left untouched.
export function parseJsonc<T = any>(text: string): T {
  let out = "";
  let inString = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += next ?? "";
        i++;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (ch === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
    } else if (ch === ",") {
      // Drop the comma if the next non-whitespace character closes a container.
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j]!)) j++;
      if (text[j] !== "}" && text[j] !== "]") out += ch;
    } else {
      out += ch;
    }
  }

  return JSON.parse(out);
}

export async function replaceJsonKey(
  filePath: string,
  targetKey: string,
  newKey: string,
  newValue: Record<string, any>,
) {
  try {
    // 1. Read the JSON file
    const fileData = await readFile(filePath, "utf8");

    // 2. Parse the string into a JavaScript object (tolerating JSONC, e.g. tsconfig.json)
    const jsonObject = parseJsonc(fileData);

    // 3. Check if the target key exists
    if (targetKey in jsonObject || (!targetKey && newKey)) {
      if (targetKey) {
        // 4. Remove the old key-value pair
        delete jsonObject[targetKey];
      }

      // 5. Add the new key-value pair
      jsonObject[newKey] = newValue;

      // 6. Convert object back to string (with 2-space indentation formatting)
      const updatedData = JSON.stringify(jsonObject, null, 2);

      // 7. Write the updated data back to the file
      await writeFile(filePath, updatedData, "utf8");
      console.log(`Successfully replaced key "${targetKey}" with "${newKey}".`);
    } else {
      console.log(`Key "${targetKey}" not found in the object.`);
    }
  } catch (error) {
    console.error("Error modifying the JSON file:", error);
  }
}
