import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Technology } from '@/lib/types';
import { Link, ClipboardList, Lightbulb } from 'lucide-react';

interface TechnologyCardProps {
  technology: Technology;
}

export function TechnologyCard({ technology }: TechnologyCardProps) {
  return (
    <Card className="flex flex-col h-full">
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
        <p className="text-muted-foreground">{technology.summary}</p>
        
        {technology.useCases.length > 0 && (
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-accent" />
              Use Cases
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
              Learn More
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
