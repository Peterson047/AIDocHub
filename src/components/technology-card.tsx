import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Technology } from '@/lib/types';
import { Link, ChevronDown } from 'lucide-react';
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
  
  const summarySnippet = technology.summary.split(' ').slice(0, 15).join(' ');
  const needsTruncation = technology.summary.split(' ').length > 15;


  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg dark:bg-card">
        {technology.imageUrl && (
            <div className="relative w-full h-32">
                 <Image
                    src={technology.imageUrl}
                    alt={`Illustration for ${technology.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint="abstract technology"
                 />
            </div>
        )}
      <CardHeader>
        <CardTitle className="font-headline text-lg">{technology.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 px-6 space-y-2">
         {technology.summary && (
            <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen} className="space-y-2">
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>{isSummaryOpen ? technology.summary : `${summarySnippet}${needsTruncation ? '...' : ''}`}</p>
                </div>
                {needsTruncation && (
                     <CollapsibleTrigger asChild>
                        <button className="flex items-center text-sm font-semibold text-primary hover:underline">
                            {isSummaryOpen ? 'Read less' : 'Read more'}
                            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isSummaryOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                    {/* The full content is already displayed when open, so this can be empty or removed if the logic is in the paragraph above */}
                </CollapsibleContent>
            </Collapsible>
        )}
        {technology.useCases.length > 0 && (
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <button className="flex items-center text-sm font-semibold text-primary hover:underline pt-2">
                Use Cases
                <ChevronDown className="h-4 w-4 ml-1 transition-transform data-[state=open]:rotate-180" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pt-2">
                    {technology.useCases.slice(0, 3).map(useCase => (
                        <li key={useCase}>{useCase}</li>
                    ))}
                </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
      <CardFooter className="pt-4 flex-col items-start gap-2">
        <div className="flex flex-wrap gap-1">
          {technology.categories.slice(0, 3).map(category => (
            <Badge key={category} variant="secondary" className="font-normal">
              {category}
            </Badge>
          ))}
        </div>
        {technology.relevantLinks.length > 0 && (
          <Button asChild variant="link" className="p-0 h-auto text-sm">
            <a href={technology.relevantLinks[0]} target="_blank" rel="noopener noreferrer">
              <Link className="w-4 h-4 mr-1.5" />
              Learn More
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
