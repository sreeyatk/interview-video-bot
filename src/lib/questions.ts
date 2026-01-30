import { InterviewCategory } from '@/hooks/useInterview';

interface Question {
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const javaQuestions: Question[] = [
  { text: "What is the difference between JDK, JRE, and JVM?", difficulty: "beginner" },
  { text: "Explain the concept of Object-Oriented Programming in Java.", difficulty: "beginner" },
  { text: "How does garbage collection work in Java?", difficulty: "intermediate" },
  { text: "Explain the difference between abstract class and interface.", difficulty: "intermediate" },
  { text: "How would you optimize a Java application for high performance?", difficulty: "advanced" }
];

const pythonQuestions: Question[] = [
  { text: "What are the key features of Python that make it popular?", difficulty: "beginner" },
  { text: "Explain the difference between a list and a tuple in Python.", difficulty: "beginner" },
  { text: "Explain Python's Global Interpreter Lock (GIL).", difficulty: "intermediate" },
  { text: "What are generators and when would you use them?", difficulty: "intermediate" },
  { text: "How would you implement concurrent programming in Python?", difficulty: "advanced" }
];

const frontendQuestions: Question[] = [
  { text: "What is the difference between HTML, CSS, and JavaScript?", difficulty: "beginner" },
  { text: "Explain the CSS Box Model.", difficulty: "beginner" },
  { text: "What are closures in JavaScript?", difficulty: "intermediate" },
  { text: "Explain the event loop in JavaScript.", difficulty: "intermediate" },
  { text: "How would you optimize the performance of a web application?", difficulty: "advanced" }
];

const phpQuestions: Question[] = [
  { text: "What are the differences between PHP 7 and PHP 8?", difficulty: "beginner" },
  { text: "Explain the difference between include and require in PHP.", difficulty: "beginner" },
  { text: "How does session management work in PHP?", difficulty: "intermediate" },
  { text: "Explain the MVC pattern in PHP frameworks.", difficulty: "intermediate" },
  { text: "How do you prevent SQL injection in PHP?", difficulty: "advanced" }
];

const reactQuestions: Question[] = [
  { text: "What is React and why would you use it?", difficulty: "beginner" },
  { text: "Explain the difference between state and props.", difficulty: "beginner" },
  { text: "What is the Virtual DOM and how does it work?", difficulty: "intermediate" },
  { text: "What is Context API and when would you use it?", difficulty: "intermediate" },
  { text: "How do you optimize performance in React applications?", difficulty: "advanced" }
];

const nodejsQuestions: Question[] = [
  { text: "What is Node.js and how does it differ from browser JavaScript?", difficulty: "beginner" },
  { text: "Explain the Node.js event-driven architecture.", difficulty: "beginner" },
  { text: "How does the Event Loop work in Node.js?", difficulty: "intermediate" },
  { text: "Explain streams in Node.js and their types.", difficulty: "intermediate" },
  { text: "Explain the cluster module and how to scale Node.js applications.", difficulty: "advanced" }
];

export function getQuestions(category: InterviewCategory): Question[] {
  const questionsMap: Record<InterviewCategory, Question[]> = {
    java: javaQuestions,
    python: pythonQuestions,
    frontend: frontendQuestions,
    php: phpQuestions,
    react: reactQuestions,
    nodejs: nodejsQuestions
  };

  return questionsMap[category] || frontendQuestions;
}

export function getCategoryLabel(category: InterviewCategory): string {
  const labels: Record<InterviewCategory, string> = {
    java: 'Java',
    python: 'Python',
    frontend: 'Frontend Development',
    php: 'PHP',
    react: 'React',
    nodejs: 'Node.js'
  };
  return labels[category];
}

export type { InterviewCategory };
