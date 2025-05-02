
import { BelvillaData } from "@/types/belvilla";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Genereert een screenshot van een accommodatie en retourneert deze als een canvas
 */
const generateAccommodationScreenshot = async (data: BelvillaData): Promise<HTMLCanvasElement> => {
  // Maak een tijdelijk element om de accommodatiegegevens in weer te geven
  const tempElement = document.createElement("div");
  tempElement.className = "accommodation-screenshot";
  tempElement.style.width = "800px";
  tempElement.style.padding = "20px";
  tempElement.style.backgroundColor = "white";
  tempElement.style.fontFamily = "system-ui, -apple-system, sans-serif";
  
  // Voeg de inhoud toe
  tempElement.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 24px; margin-bottom: 10px;">${data.title}</h2>
      <p style="color: #666; margin-bottom: 20px;">${data.location.city}, ${data.location.region}, ${data.location.country}</p>
      
      ${data.photos[0] ? `<img src="${data.photos[0]}" alt="${data.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` : ''}
      
      <div style="display: flex; margin-bottom: 20px; gap: 15px;">
        <div style="flex: 1; padding: 15px; border-radius: 8px; background-color: #f7f7f7;">
          <h4 style="font-size: 16px; margin: 0 0 10px 0;">Capaciteit</h4>
          <p style="margin: 0;">${data.capacity.persons} personen | ${data.capacity.bedrooms} slaapkamers | ${data.capacity.bathrooms} badkamers</p>
        </div>
        <div style="flex: 1; padding: 15px; border-radius: 8px; background-color: #f7f7f7;">
          <h4 style="font-size: 16px; margin: 0 0 10px 0;">Prijs</h4>
          <p style="margin: 0;">€ ${data.price.basePrice} (${data.price.description})</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 16px; margin: 0 0 10px 0;">Omschrijving</h4>
        <p style="margin: 0;">${data.description.substring(0, 300)}${data.description.length > 300 ? '...' : ''}</p>
      </div>
      
      <div>
        <h4 style="font-size: 16px; margin: 0 0 10px 0;">Voorzieningen</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${data.amenities.slice(0, 9).map(amenity => `
            <span style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 14px;">${amenity}</span>
          `).join('')}
          ${data.amenities.length > 9 ? `<span style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 14px;">+${data.amenities.length - 9} meer</span>` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Voeg het element toe aan de body (nodig voor html2canvas)
  document.body.appendChild(tempElement);
  
  try {
    // Genereer een screenshot
    const canvas = await html2canvas(tempElement, {
      backgroundColor: "#ffffff",
      scale: 2, // Hogere kwaliteit
      logging: false,
      useCORS: true, // Voor afbeeldingen van andere domeinen
    });
    
    return canvas;
  } finally {
    // Verwijder het tijdelijke element
    document.body.removeChild(tempElement);
  }
};

/**
 * Exporteert screenshots van alle accommodaties als een ZIP-bestand
 */
export const exportScreenshots = async (data: BelvillaData[]): Promise<void> => {
  // Maak een nieuwe ZIP
  const zip = new JSZip();
  
  // Voor elke accommodatie
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    try {
      // Genereer de screenshot
      const canvas = await generateAccommodationScreenshot(item);
      
      // Converteer naar blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/png");
      });
      
      // Voeg toe aan ZIP
      zip.file(`${item.id}-${item.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`, blob);
    } catch (error) {
      console.error(`Fout bij het genereren van screenshot voor ${item.title}:`, error);
    }
  }
  
  // Genereer en download de ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `accommodatie-screenshots-${data.length}.zip`);
};
