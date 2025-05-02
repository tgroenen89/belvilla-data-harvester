
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
        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
        <div className="text-sm text-muted-foreground mb-2">ID: {item.id}</div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Capaciteit</h4>
          <div className="flex gap-4">
            <div><span className="font-semibold">{item.capacity.persons}</span> personen</div>
            <div><span className="font-semibold">{item.capacity.bedrooms}</span> slaapkamers</div>
            <div><span className="font-semibold">{item.capacity.bathrooms}</span> badkamers</div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Beschrijving</h4>
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
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Regels</h4>
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
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Beoordeling</h4>
          <div className="flex gap-2 items-center">
            <div className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-md">
              <span className="font-semibold">{item.rating.score}</span>/10
            </div>
            <div className="text-sm text-muted-foreground">
              ({item.rating.count} beoordelingen)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewTab;
