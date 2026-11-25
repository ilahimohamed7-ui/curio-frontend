export interface Post {
  id: string;
  category: string;
  title: string;
  description: string;
  source: string;
  emoji: string;
  likes: number;
  comments: number;
  color: 'purple' | 'blue' | 'orange';
  /** Erstellungszeitpunkt als ISO-String. */
  createdAt: string;
  /** `true`, wenn der Beitrag von der KI (Gemini) erzeugt wurde. */
  aiGenerated: boolean;
}
