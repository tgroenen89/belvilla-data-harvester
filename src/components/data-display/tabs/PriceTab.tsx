
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BelvillaData } from "@/types/belvilla";

interface PriceTabProps {
  item: BelvillaData;
}

const PriceTab = ({ item }: PriceTabProps) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-semibold mb-4">Prijsinformatie</h3>
        
        <div className="mb-4">
          <div className="text-2xl font-bold">€ {item.price.basePrice}</div>
          <div className="text-sm text-muted-foreground">{item.price.description}</div>
        </div>
        
        {item.price.additionalCosts && item.price.additionalCosts.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Bijkomende kosten</h4>
            <ul className="space-y-1">
              {item.price.additionalCosts.map((cost, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{cost.description}</span>
                  <span>{cost.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {item.price.info && (
          <div className="text-sm text-muted-foreground">
            <Separator className="my-2" />
            {item.price.info}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceTab;
