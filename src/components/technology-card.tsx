import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Technology } from '@/lib/types';
import { Link, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface TechnologyCardProps {
  technology: Technology;
}

export function TechnologyCard({ technology }: TechnologyCardProps) {
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(false);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
        {technology.imageUrl && (
            <div className="relative w-full h-40">
                 <Image
                    src={technology.imageUrl}
                    alt={`Ilustração para ${technology.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint="abstract technology"
                 />
            </div>
        )}
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">{technology.name}</CardTitle>
        <div className="flex flex-wrap gap-1 pt-2">
          {technology.categories.map(category => (
            <Badge key={category} variant="secondary" className="font-normal">
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
          <CollapsibleContent className="text-sm text-muted-foreground space-y-2 prose-sm">
            <p>{technology.summary}</p>
          </CollapsibleContent>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-center text-accent -mb-2">
              {isSummaryOpen ? <ChevronUp className="mr-2"/> : <ChevronDown className="mr-2" />}
              {isSummaryOpen ? 'Mostrar menos' : 'Mostrar resumo'}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
        
        {technology.useCases.length > 0 && (
          <div className="pt-4">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-accent" />
              Casos de Uso
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {technology.useCases.slice(0, 3).map(useCase => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {technology.relevantLinks.length > 0 && (
          <Button asChild variant="link" className="p-0 h-auto">
            <a href={technology.relevantLinks[0]} target="_blank" rel="noopener noreferrer">
              <Link className="w-4 h-4 mr-2" />
              Saiba Mais
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
