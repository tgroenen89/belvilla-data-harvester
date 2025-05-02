
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BelvillaData } from "@/types/belvilla";
import { exportToJson, exportToCsv } from "@/utils/dataExport";

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
    </div>
  );
};

export default ExportButtons;
