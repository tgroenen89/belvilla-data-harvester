
/**
 * Utility functions for exporting data in different formats
 */

/**
 * Export data as JSON file and trigger download in the browser
 * @param data Data to export
 * @param filename Name of the file without extension
 */
export const exportToJson = (data: any, filename: string): void => {
  // Convert data object to JSON string
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: "application/json" });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement("a");
  
  // Set link attributes
  link.href = url;
  link.download = `${filename}.json`;
  
  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the blob URL
  URL.revokeObjectURL(url);
};

/**
 * Export data as CSV file and trigger download in the browser
 * @param data Data to export as array of objects
 * @param filename Name of the file without extension
 */
export const exportToCsv = (data: Record<string, any>[], filename: string): void => {
  if (!data || !data.length) {
    console.error("No data to export");
    return;
  }
  
  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [
    headers.join(",")
  ];
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle strings with commas by wrapping in quotes
      const cellValue = value !== null && value !== undefined ? String(value) : '';
      return cellValue.includes(',') ? `"${cellValue}"` : cellValue;
    });
    csvRows.push(values.join(','));
  }
  
  // Join rows with newlines
  const csvString = csvRows.join('\n');
  
  // Create a blob with the CSV data
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement("a");
  
  // Set link attributes
  link.href = url;
  link.download = `${filename}.csv`;
  
  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the blob URL
  URL.revokeObjectURL(url);
};
