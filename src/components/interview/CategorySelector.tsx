import { InterviewCategory } from '@/hooks/useInterview';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Code, Braces, Globe, Server, Atom, Hexagon } from 'lucide-react';

interface CategorySelectorProps {
  onSelect: (category: InterviewCategory) => void;
}

const categories: { id: InterviewCategory; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'java', name: 'Java', icon: <Code className="w-8 h-8" />, color: 'from-orange-500 to-red-600' },
  { id: 'python', name: 'Python', icon: <Braces className="w-8 h-8" />, color: 'from-blue-500 to-yellow-500' },
  { id: 'frontend', name: 'Frontend', icon: <Globe className="w-8 h-8" />, color: 'from-cyan-500 to-blue-600' },
  { id: 'php', name: 'PHP', icon: <Server className="w-8 h-8" />, color: 'from-indigo-500 to-purple-600' },
  { id: 'react', name: 'React', icon: <Atom className="w-8 h-8" />, color: 'from-sky-400 to-blue-500' },
  { id: 'nodejs', name: 'Node.js', icon: <Hexagon className="w-8 h-8" />, color: 'from-green-500 to-emerald-600' }
];

export function CategorySelector({ onSelect }: CategorySelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-foreground mb-2">Select Interview Category</h2>
        <p className="text-muted-foreground">Choose the technology you want to be interviewed for</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
              onClick={() => onSelect(category.id)}
            >
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">10 questions</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
