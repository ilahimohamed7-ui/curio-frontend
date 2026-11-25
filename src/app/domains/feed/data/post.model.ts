
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
}
