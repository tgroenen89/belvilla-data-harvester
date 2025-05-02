
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BelvillaData } from "@/types/belvilla";

interface OverviewTabProps {
  item: BelvillaData;
}

const OverviewTab = ({ item }: OverviewTabProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  const toggleDescription = () => setIsDescriptionExpanded(prev => !prev);
  const toggleRules = () => setIsRulesExpanded(prev => !prev);

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold mb-2">{item.title || "Geen titel gevonden"}</h3>
        <div className="text-sm text-muted-foreground mb-2">ID: {item.id || "Onbekend"}</div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Capaciteit</h4>
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="font-semibold">
                {item.capacity.persons ? item.capacity.persons : "?"}
              </span> personen
            </div>
            <div>
              <span className="font-semibold">
                {item.capacity.bedrooms ? item.capacity.bedrooms : "?"}
              </span> slaapkamers
            </div>
            <div>
              <span className="font-semibold">
                {item.capacity.bathrooms ? item.capacity.bathrooms : "?"}
              </span> badkamers
            </div>
            {item.capacity.area && (
              <div>
                <span className="font-semibold">{item.capacity.area}</span> m²
              </div>
            )}
            {item.capacity.type && (
              <div>
                <span className="font-semibold">Type:</span> {item.capacity.type}
              </div>
            )}
          </div>
          {!item.capacity.persons && !item.capacity.bedrooms && !item.capacity.bathrooms && (
            <div className="text-sm text-muted-foreground mt-1">Geen capaciteitsgegevens gevonden</div>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Beschrijving</h4>
          {item.description ? (
            <div className="text-sm">
              {isDescriptionExpanded 
                ? item.description 
                : item.description.substring(0, 150) + "..."}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDescription}
                className="ml-1"
              >
                {isDescriptionExpanded 
                  ? <ChevronUp className="h-3 w-3" /> 
                  : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Geen beschrijving gevonden</div>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Regels</h4>
          {item.rules && item.rules.length > 0 ? (
            <div className="text-sm">
              {isRulesExpanded 
                ? (
                  <ul className="list-disc list-inside">
                    {item.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                ) 
                : (
                  <>
                    {item.rules.slice(0, 2).map((rule, i) => (
                      <div key={i}>{rule}</div>
                    ))}
                    {item.rules.length > 2 && (
                      <div>+{item.rules.length - 2} meer</div>
                    )}
                  </>
                )}
              {item.rules.length > 2 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleRules}
                >
                  {isRulesExpanded 
                    ? <ChevronUp className="h-3 w-3" /> 
                    : <ChevronDown className="h-3 w-3" />}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Geen regels gevonden</div>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Beoordeling</h4>
          {item.rating.score > 0 ? (
            <div className="flex gap-2 items-center">
              <div className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-md">
                <span className="font-semibold">{item.rating.score}</span>/10
              </div>
              <div className="text-sm text-muted-foreground">
                ({item.rating.count || 0} beoordelingen)
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Geen beoordelingen gevonden</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewTab;
