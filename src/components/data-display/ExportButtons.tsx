
import { Button } from "@/components/ui/button";
import { Download, Camera } from "lucide-react";
import { BelvillaData } from "@/types/belvilla";
import { exportToJson, exportToCsv } from "@/utils/dataExport";
import { exportScreenshots } from "@/utils/screenshotExport";
import { toast } from "sonner";

interface ExportButtonsProps {
  data: BelvillaData[];
}

const ExportButtons = ({ data }: ExportButtonsProps) => {
  const handleExportJson = () => {
    if (data.length === 1) {
      exportToJson(data[0], `belvilla-${data[0].id}`);
    } else {
      exportToJson(data, `belvilla-accommodaties-${data.length}`);
    }
  };
  
  const handleExportCsv = () => {
    // Convert the nested BelvillaData objects to a flattened structure for CSV
    const flattenedData = data.map(item => ({
      id: item.id,
      title: item.title,
      country: item.location.country,
      region: item.location.region,
      city: item.location.city,
      persons: item.capacity.persons,
      bedrooms: item.capacity.bedrooms,
      bathrooms: item.capacity.bathrooms,
      description: item.description,
      amenities: item.amenities.join(', '),
      photos: item.photos.join(', '),
      basePrice: item.price.basePrice,
      priceDescription: item.price.description,
      priceInfo: item.price.info,
      ratingScore: item.rating.score,
      ratingCount: item.rating.count,
      rules: item.rules.join(', ')
    }));
    
    exportToCsv(flattenedData, `belvilla-accommodaties-${data.length}`);
  };

  const handleExportScreenshots = async () => {
    toast.info("Bezig met genereren van screenshots...");
    
    try {
      await exportScreenshots(data);
      toast.success("Screenshots succesvol geëxporteerd!");
    } catch (error) {
      console.error("Error exporting screenshots:", error);
      toast.error("Er is een fout opgetreden bij het exporteren van screenshots");
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExportCsv}>
        <Download className="h-4 w-4 mr-2" />
        Exporteer als CSV
      </Button>
      <Button variant="outline" onClick={handleExportJson}>
        <Download className="h-4 w-4 mr-2" />
        Exporteer als JSON
      </Button>
      <Button variant="outline" onClick={handleExportScreenshots}>
        <Camera className="h-4 w-4 mr-2" />
        Exporteer Screenshots
      </Button>
    </div>
  );
};

export default ExportButtons;
