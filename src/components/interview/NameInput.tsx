import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle, ArrowRight } from 'lucide-react';

interface NameInputProps {
  onSubmit: (name: string) => void;
  onBack: () => void;
}

export function NameInput({ onSubmit, onBack }: NameInputProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center"
          >
            <UserCircle className="w-10 h-10 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl">Enter Your Name</CardTitle>
          <CardDescription>
            This will be used to personalize your interview experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-lg"
                autoFocus
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1 gap-2" disabled={!name.trim()}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
