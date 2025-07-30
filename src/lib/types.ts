export interface Technology {
  id: number;
  name: string;
  summary: string;
  description: string; // The full description from the AI
  categories: string[];
  useCases: string[];
  relevantLinks: string[];
  imageUrl: string;
}
