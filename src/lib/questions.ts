import { InterviewCategory } from '@/hooks/useInterview';

interface Question {
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const javaQuestions: Question[] = [
  { text: "What is the difference between JDK, JRE, and JVM?", difficulty: "beginner" },
  { text: "Explain the concept of Object-Oriented Programming in Java.", difficulty: "beginner" },
  { text: "What are the differences between ArrayList and LinkedList?", difficulty: "beginner" },
  { text: "How does garbage collection work in Java?", difficulty: "intermediate" },
  { text: "Explain the difference between abstract class and interface.", difficulty: "intermediate" },
  { text: "What is multithreading and how do you implement it in Java?", difficulty: "intermediate" },
  { text: "What are design patterns? Explain the Singleton pattern.", difficulty: "intermediate" },
  { text: "Explain the Java Memory Model and its significance.", difficulty: "advanced" },
  { text: "What are lambda expressions and functional interfaces?", difficulty: "advanced" },
  { text: "How would you optimize a Java application for high performance?", difficulty: "advanced" }
];

const pythonQuestions: Question[] = [
  { text: "What are the key features of Python that make it popular?", difficulty: "beginner" },
  { text: "Explain the difference between a list and a tuple in Python.", difficulty: "beginner" },
  { text: "What are decorators in Python and how do they work?", difficulty: "beginner" },
  { text: "Explain Python's Global Interpreter Lock (GIL).", difficulty: "intermediate" },
  { text: "What are generators and when would you use them?", difficulty: "intermediate" },
  { text: "How does Python handle memory management?", difficulty: "intermediate" },
  { text: "Explain the difference between deep copy and shallow copy.", difficulty: "intermediate" },
  { text: "What are metaclasses in Python?", difficulty: "advanced" },
  { text: "How would you implement concurrent programming in Python?", difficulty: "advanced" },
  { text: "Explain Python's descriptor protocol.", difficulty: "advanced" }
];

const frontendQuestions: Question[] = [
  { text: "What is the difference between HTML, CSS, and JavaScript?", difficulty: "beginner" },
  { text: "Explain the CSS Box Model.", difficulty: "beginner" },
  { text: "What is the DOM and how do you manipulate it?", difficulty: "beginner" },
  { text: "Explain the event loop in JavaScript.", difficulty: "intermediate" },
  { text: "What are closures in JavaScript?", difficulty: "intermediate" },
  { text: "Explain the difference between var, let, and const.", difficulty: "intermediate" },
  { text: "What is responsive design and how do you implement it?", difficulty: "intermediate" },
  { text: "Explain how virtual DOM works in React.", difficulty: "advanced" },
  { text: "What are Web Workers and when would you use them?", difficulty: "advanced" },
  { text: "How would you optimize the performance of a web application?", difficulty: "advanced" }
];

const phpQuestions: Question[] = [
  { text: "What are the differences between PHP 7 and PHP 8?", difficulty: "beginner" },
  { text: "Explain the difference between include and require in PHP.", difficulty: "beginner" },
  { text: "What is the difference between GET and POST methods?", difficulty: "beginner" },
  { text: "How does session management work in PHP?", difficulty: "intermediate" },
  { text: "Explain PHP namespaces and their benefits.", difficulty: "intermediate" },
  { text: "What is Composer and how do you use it?", difficulty: "intermediate" },
  { text: "Explain the MVC pattern in PHP frameworks.", difficulty: "intermediate" },
  { text: "How do you prevent SQL injection in PHP?", difficulty: "advanced" },
  { text: "Explain PHP's garbage collection mechanism.", difficulty: "advanced" },
  { text: "How would you implement caching in a PHP application?", difficulty: "advanced" }
];

const reactQuestions: Question[] = [
  { text: "What is React and why would you use it?", difficulty: "beginner" },
  { text: "Explain the difference between state and props.", difficulty: "beginner" },
  { text: "What are React hooks? Explain useState and useEffect.", difficulty: "beginner" },
  { text: "What is the Virtual DOM and how does it work?", difficulty: "intermediate" },
  { text: "Explain the component lifecycle in React.", difficulty: "intermediate" },
  { text: "What is Context API and when would you use it?", difficulty: "intermediate" },
  { text: "Explain the difference between controlled and uncontrolled components.", difficulty: "intermediate" },
  { text: "How do you optimize performance in React applications?", difficulty: "advanced" },
  { text: "Explain React's reconciliation algorithm.", difficulty: "advanced" },
  { text: "What are Higher-Order Components and render props patterns?", difficulty: "advanced" }
];

const nodejsQuestions: Question[] = [
  { text: "What is Node.js and how does it differ from browser JavaScript?", difficulty: "beginner" },
  { text: "Explain the Node.js event-driven architecture.", difficulty: "beginner" },
  { text: "What are modules in Node.js? Explain require vs import.", difficulty: "beginner" },
  { text: "How does the Event Loop work in Node.js?", difficulty: "intermediate" },
  { text: "Explain streams in Node.js and their types.", difficulty: "intermediate" },
  { text: "What is the difference between process.nextTick and setImmediate?", difficulty: "intermediate" },
  { text: "How do you handle errors in asynchronous Node.js code?", difficulty: "intermediate" },
  { text: "Explain the cluster module and how to scale Node.js applications.", difficulty: "advanced" },
  { text: "How would you implement authentication in a Node.js application?", difficulty: "advanced" },
  { text: "What are microservices and how would you implement them with Node.js?", difficulty: "advanced" }
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
