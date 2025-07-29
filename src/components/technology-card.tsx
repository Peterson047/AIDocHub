import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Technology } from '@/lib/types';
import { Link, ClipboardList } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


interface TechnologyCardProps {
  technology: Technology;
}

export function TechnologyCard({ technology }: TechnologyCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
        {technology.imageUrl && (
            <div className="relative w-full h-32">
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
        <CardTitle className="font-headline text-lg text-primary">{technology.name}</CardTitle>
        <div className="flex flex-wrap gap-1 pt-1">
          {technology.categories.slice(0, 3).map(category => (
            <Badge key={category} variant="secondary" className="font-normal">
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 px-6 space-y-2">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="summary">
            <AccordionTrigger className="text-sm font-semibold py-2">Resumo</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {technology.summary}
            </AccordionContent>
          </AccordionItem>
          {technology.useCases.length > 0 && (
             <AccordionItem value="use-cases">
                <AccordionTrigger className="text-sm font-semibold py-2">Casos de Uso</AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {technology.useCases.slice(0, 3).map(useCase => (
                            <li key={useCase}>{useCase}</li>
                        ))}
                    </ul>
                </AccordionContent>
             </AccordionItem>
          )}
        </Accordion>
      </CardContent>
      <CardFooter className="pt-4">
        {technology.relevantLinks.length > 0 && (
          <Button asChild variant="link" className="p-0 h-auto text-sm">
            <a href={technology.relevantLinks[0]} target="_blank" rel="noopener noreferrer">
              <Link className="w-4 h-4 mr-1.5" />
              Saiba Mais
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
