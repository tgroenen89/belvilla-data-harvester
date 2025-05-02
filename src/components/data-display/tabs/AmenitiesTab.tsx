
import { Card, CardContent } from "@/components/ui/card";
import { BelvillaData } from "@/types/belvilla";

interface AmenitiesTabProps {
  item: BelvillaData;
}

const AmenitiesTab = ({ item }: AmenitiesTabProps) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-semibold mb-4">Voorzieningen</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {item.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmenitiesTab;
