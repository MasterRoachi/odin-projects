/* =========================================================
   Getting a CV in and out as a file.
   ========================================================= */

/** Offers the CV as a download, without a server. */
export function downloadJson(cv, filename = "cv.json") {
  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  // the blob stays in memory until it is let go of
  URL.revokeObjectURL(url);
}

/** Reads a chosen file and resolves with the parsed CV. */
export function readJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch {
        reject(new Error("That file is not valid JSON."));
      }
    };
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.readAsText(file);
  });
}
