
import { Card, CardContent } from "@/components/ui/card";
import { BelvillaData } from "@/types/belvilla";

interface LocationTabProps {
  item: BelvillaData;
}

const LocationTab = ({ item }: LocationTabProps) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-semibold mb-4">Locatiegegevens</h3>
        <div className="space-y-2">
          <div><span className="font-medium">Land:</span> {item.location.country}</div>
          <div><span className="font-medium">Regio:</span> {item.location.region}</div>
          <div><span className="font-medium">Plaats:</span> {item.location.city}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationTab;
