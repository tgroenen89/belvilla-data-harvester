
import { BelvillaData } from "@/types/belvilla";
import { exportToCsv } from "./dataExport";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ComparisonEntry {
  field: string;
  expected: string;
  actual: string;
  match: boolean;
}

/**
 * Generate a special export that compares the extracted data with the expected data
 * based on the sample image and source code
 * @param data BelvillaData objects to compare
 */
export const exportComparisonData = async (data: BelvillaData[]): Promise<void> => {
  // In een echte situatie zou deze functie de verwachte data ophalen uit de broncode
  // Voor deze demo gebruiken we hardcoded verwachte data gebaseerd op de geüploade afbeelding
  const expectedData = {
    id: "100053404",
    title: "Schitterende yurt van Mongoolse in de Provence",
    location: {
      country: "Frankrijk",
      region: "Provence",
      city: "Puyméras"
    },
    capacity: {
      persons: 4,
      bedrooms: 1, 
      bathrooms: 1,
      area: 310
    },
    description: "Deze luxe safari tent kan tot 4 personen herbergen. Een originele kampeertent van 35 m2.", 
    amenities: ["Zwembad", "BBQ", "Keuken", "Fornuis", "Koelkast", "Koffiezetapparaat", "WiFi", "Chique bed", "Ligplaats", "(Park) Bed", "Rookvrij"],
    price: {
      basePrice: 115,
      description: "per nacht",
      info: "Inclusief: • Final cleaning • Deposit • Service • Bed linen/towels • Booking fee • Kitchen linen",
    },
    rating: {
      score: 8.0,
      count: 1
    },
    rules: ["Aankomst: 16:00 - 19:00", "Vertrek: 10:00 - 12:00"]
  };

  // Maak vergelijkingsdata voor elk item
  const comparisonResults: ComparisonEntry[][] = [];
  
  for (const item of data) {
    const comparison: ComparisonEntry[] = [
      {
        field: "ID",
        expected: expectedData.id,
        actual: item.id,
        match: expectedData.id === item.id
      },
      {
        field: "Titel",
        expected: expectedData.title,
        actual: item.title,
        match: expectedData.title === item.title
      },
      {
        field: "Land",
        expected: expectedData.location.country,
        actual: item.location.country,
        match: expectedData.location.country === item.location.country
      },
      {
        field: "Regio",
        expected: expectedData.location.region,
        actual: item.location.region,
        match: expectedData.location.region === item.location.region
      },
      {
        field: "Stad",
        expected: expectedData.location.city,
        actual: item.location.city,
        match: expectedData.location.city === item.location.city
      },
      {
        field: "Personen",
        expected: expectedData.capacity.persons.toString(),
        actual: item.capacity.persons.toString(),
        match: expectedData.capacity.persons === item.capacity.persons
      },
      {
        field: "Slaapkamers",
        expected: expectedData.capacity.bedrooms.toString(),
        actual: item.capacity.bedrooms.toString(),
        match: expectedData.capacity.bedrooms === item.capacity.bedrooms
      },
      {
        field: "Badkamers",
        expected: expectedData.capacity.bathrooms.toString(),
        actual: item.capacity.bathrooms.toString(),
        match: expectedData.capacity.bathrooms === item.capacity.bathrooms
      },
      {
        field: "Oppervlakte (m²)",
        expected: expectedData.capacity.area.toString(),
        actual: item.capacity.area ? item.capacity.area.toString() : "Onbekend",
        match: item.capacity.area === expectedData.capacity.area
      },
      {
        field: "Beoordeling",
        expected: expectedData.rating.score.toString(),
        actual: item.rating.score.toString(),
        match: Math.abs(expectedData.rating.score - item.rating.score) < 0.1
      },
      {
        field: "Aantal beoordelingen",
        expected: expectedData.rating.count.toString(),
        actual: item.rating.count.toString(),
        match: expectedData.rating.count === item.rating.count
      },
      {
        field: "Prijs",
        expected: expectedData.price.basePrice.toString(),
        actual: item.price.basePrice.toString(),
        match: Math.abs(expectedData.price.basePrice - item.price.basePrice) < 0.1
      }
    ];

    // Voeg beschrijvingsvergelijking toe
    // We controleren hier of de beschrijving de verwachte beschrijving bevat
    comparison.push({
      field: "Beschrijving",
      expected: expectedData.description,
      actual: item.description.substring(0, 100) + "...",
      match: item.description.includes(expectedData.description.substring(0, 20))
    });

    // Controleer of alle verwachte voorzieningen aanwezig zijn
    const amenitiesMatch = expectedData.amenities.every(amenity => 
      item.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
    );
    comparison.push({
      field: "Voorzieningen",
      expected: expectedData.amenities.join(", "),
      actual: item.amenities.slice(0, 5).join(", ") + (item.amenities.length > 5 ? "..." : ""),
      match: amenitiesMatch
    });

    // Controleer of alle verwachte regels aanwezig zijn
    const rulesMatch = expectedData.rules.every(rule => 
      item.rules.some(r => r.toLowerCase().includes(rule.toLowerCase()))
    );
    comparison.push({
      field: "Regels",
      expected: expectedData.rules.join(", "),
      actual: item.rules.slice(0, 2).join(", ") + (item.rules.length > 2 ? "..." : ""),
      match: rulesMatch
    });

    comparisonResults.push(comparison);
  }

  // Genereer zowel CSV als visuele vergelijking
  exportComparisonCSV(comparisonResults, data);
  await exportComparisonVisual(comparisonResults, data);
};

/**
 * Exporteert vergelijkingsresultaten als CSV
 */
const exportComparisonCSV = (comparisons: ComparisonEntry[][], data: BelvillaData[]): void => {
  const flattenedData = comparisons.map((comparison, index) => {
    const flatObject: Record<string, string> = {
      accommodatie_id: data[index].id,
      accommodatie_titel: data[index].title
    };
    
    comparison.forEach(entry => {
      flatObject[`${entry.field}_verwacht`] = entry.expected;
      flatObject[`${entry.field}_werkelijk`] = entry.actual;
      flatObject[`${entry.field}_match`] = entry.match ? "Ja" : "Nee";
    });
    
    return flatObject;
  });
  
  exportToCsv(flattenedData, `vergelijking-data-${new Date().toISOString().split('T')[0]}`);
};

/**
 * Genereert een visuele vergelijking en exporteert deze als HTML
 */
const exportComparisonVisual = async (
  comparisons: ComparisonEntry[][], 
  data: BelvillaData[]
): Promise<void> => {
  // Maak een tijdelijk HTML-element om de vergelijking weer te geven
  const container = document.createElement("div");
  container.style.fontFamily = "Arial, sans-serif";
  container.style.padding = "20px";
  container.style.maxWidth = "1200px";
  container.style.margin = "0 auto";
  container.style.backgroundColor = "white";
  
  // Titel en inleiding
  const title = document.createElement("h1");
  title.textContent = "Vergelijkingsrapport Belvilla Data";
  title.style.borderBottom = "2px solid #007bff";
  title.style.paddingBottom = "10px";
  container.appendChild(title);
  
  const intro = document.createElement("p");
  intro.textContent = `Rapport gegenereerd op ${new Date().toLocaleString()}`;
  container.appendChild(intro);
  
  // Voeg voor elke accommodatie een vergelijkingstabel toe
  for (let i = 0; i < comparisons.length; i++) {
    const itemTitle = document.createElement("h2");
    itemTitle.textContent = data[i].title;
    container.appendChild(itemTitle);
    
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "30px";
    
    // Tabelkop
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.style.backgroundColor = "#f8f9fa";
    
    ["Veld", "Verwachte waarde", "Werkelijke waarde", "Overeenkomst"].forEach(headerText => {
      const th = document.createElement("th");
      th.textContent = headerText;
      th.style.padding = "10px";
      th.style.border = "1px solid #dee2e6";
      th.style.textAlign = "left";
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Tabelinhoud
    const tbody = document.createElement("tbody");
    
    comparisons[i].forEach(entry => {
      const row = document.createElement("tr");
      
      // Veld
      const fieldCell = document.createElement("td");
      fieldCell.textContent = entry.field;
      fieldCell.style.padding = "10px";
      fieldCell.style.border = "1px solid #dee2e6";
      fieldCell.style.fontWeight = "bold";
      row.appendChild(fieldCell);
      
      // Verwachte waarde
      const expectedCell = document.createElement("td");
      expectedCell.textContent = entry.expected;
      expectedCell.style.padding = "10px";
      expectedCell.style.border = "1px solid #dee2e6";
      row.appendChild(expectedCell);
      
      // Werkelijke waarde
      const actualCell = document.createElement("td");
      actualCell.textContent = entry.actual;
      actualCell.style.padding = "10px";
      actualCell.style.border = "1px solid #dee2e6";
      row.appendChild(actualCell);
      
      // Match
      const matchCell = document.createElement("td");
      if (entry.match) {
        matchCell.textContent = "✓";
        matchCell.style.color = "green";
        matchCell.style.fontWeight = "bold";
      } else {
        matchCell.textContent = "✗";
        matchCell.style.color = "red";
        matchCell.style.fontWeight = "bold";
      }
      matchCell.style.padding = "10px";
      matchCell.style.border = "1px solid #dee2e6";
      matchCell.style.textAlign = "center";
      row.appendChild(matchCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Voeg een brongedeelte toe voor de afbeelding
    const sourcesTitle = document.createElement("h3");
    sourcesTitle.textContent = "Databronnen";
    container.appendChild(sourcesTitle);
    
    // Voeg voor deze demo een afbeelding toe van de geüploade screenshot
    const imageSection = document.createElement("div");
    const imageTitle = document.createElement("h4");
    imageTitle.textContent = "Originele screenshot";
    imageSection.appendChild(imageTitle);
    
    const image = document.createElement("img");
    image.src = "/lovable-uploads/f038ab2b-2ad7-4fba-a4a6-57c470d21d5d.png";
    image.style.maxWidth = "600px";
    image.style.border = "1px solid #dee2e6";
    image.style.margin = "10px 0";
    imageSection.appendChild(image);
    
    container.appendChild(imageSection);
  }
  
  // Voeg het tijdelijke element toe aan de body
  document.body.appendChild(container);
  
  try {
    // Maak een screenshot van het vergelijkingsrapport
    const canvas = await html2canvas(container, { 
      scale: 1, 
      logging: false,
      backgroundColor: "#ffffff"
    });
    
    // Maak een ZIP-bestand met het HTML-rapport en de afbeelding
    const zip = new JSZip();
    
    // Voeg het HTML-rapport toe
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Vergelijkingsrapport Belvilla Data</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 10px; border: 1px solid #dee2e6; text-align: left; }
          th { background-color: #f8f9fa; }
          .match-yes { color: green; font-weight: bold; text-align: center; }
          .match-no { color: red; font-weight: bold; text-align: center; }
          h1 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          img { max-width: 100%; border: 1px solid #dee2e6; margin: 10px 0; }
        </style>
      </head>
      <body>
        ${container.innerHTML}
      </body>
      </html>
    `;
    zip.file("vergelijkingsrapport.html", htmlContent);
    
    // Voeg de screenshot toe
    canvas.toBlob((blob) => {
      if (blob) {
        zip.file("vergelijkingsrapport.png", blob);
        
        // Voeg de originele afbeelding toe als beschikbaar
        fetch("/lovable-uploads/f038ab2b-2ad7-4fba-a4a6-57c470d21d5d.png")
          .then(response => response.blob())
          .then(imageBlob => {
            zip.file("originele_screenshot.png", imageBlob);
            
            // Genereer en download het ZIP-bestand
            zip.generateAsync({ type: "blob" })
              .then(zipBlob => {
                saveAs(zipBlob, `vergelijking-rapport-${new Date().toISOString().split('T')[0]}.zip`);
              });
          })
          .catch(error => {
            console.error("Fout bij het toevoegen van de originele afbeelding:", error);
            // Ga door met downloaden zonder de originele afbeelding
            zip.generateAsync({ type: "blob" })
              .then(zipBlob => {
                saveAs(zipBlob, `vergelijking-rapport-${new Date().toISOString().split('T')[0]}.zip`);
              });
          });
      }
    });
  } finally {
    // Verwijder het tijdelijke element
    document.body.removeChild(container);
  }
};
