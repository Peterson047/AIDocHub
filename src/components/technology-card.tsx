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

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
    } catch (error) {
      console.error("Invalid URL for favicon:", url);
      return '/favicon.ico'; // Fallback to the site's favicon
    }
  };

  const faviconUrl = technology.relevantLinks.length > 0
    ? getFaviconUrl(technology.relevantLinks[0])
    : '/favicon.ico';


  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg dark:bg-card">
        <div className="flex items-center p-6">
            <div className="relative w-10 h-10 mr-4 flex-shrink-0">
                 <Image
                    src={faviconUrl}
                    alt={`Icon for ${technology.name}`}
                    fill
                    className="object-contain"
                    sizes="40px"
                    unoptimized
                 />
            </div>
            <CardHeader className="p-0">
                <CardTitle className="font-headline text-lg">{technology.name}</CardTitle>
            </CardHeader>
        </div>

      <CardContent className="flex-grow px-6 pb-6 space-y-2">
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
          <Collapsible className="w-full" defaultOpen>
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
      <CardFooter className="pt-4 flex-col items-start gap-2 px-6 pb-6">
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
