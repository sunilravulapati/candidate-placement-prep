// src/app/(dashboard)/knowledge-hub/page.tsx
'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Layers,
  Cpu,
  Database,
  Globe,
  Code2,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  RotateCw,
  Zap,
  Star,
  FileText,
  FolderTree,
  Lightbulb,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

type KnowledgeTab = 'core-cs' | 'flashcards' | 'system-design' | 'behavioral' | 'my-notes';

interface Flashcard {
  id: string;
  category: string;
  question: string;
  answer: string;
  keyPoints: string[];
}

const FLASHCARDS: Flashcard[] = [
  {
    id: '1',
    category: 'Operating Systems',
    question: 'What is the difference between a Process and a Thread?',
    answer: 'A Process is an independent execution unit with its own virtual memory space and system resources. A Thread is a lightweight sub-unit of execution within a process that shares the parent process memory heap, global variables, and file descriptors but maintains its own stack and program counter.',
    keyPoints: ['Process = Isolated memory space', 'Thread = Shared memory, independent stack', 'Context switching is much faster between threads.'],
  },
  {
    id: '2',
    category: 'DBMS',
    question: 'Explain ACID Properties in Relational Databases.',
    answer: 'ACID ensures reliable transaction processing: Atomicity (all operations succeed or all roll back), Consistency (database moves from one valid state to another), Isolation (concurrent transactions execute independently without interference), and Durability (committed changes persist permanently even during crashes).',
    keyPoints: ['A = All or nothing', 'C = Valid state integrity', 'I = Concurrency separation', 'D = Crash-resilient write-ahead logging (WAL)'],
  },
  {
    id: '3',
    category: 'Computer Networks',
    question: 'What happens when you type https://google.com into your browser?',
    answer: '1. Browser checks DNS cache (local, OS, router, ISP recursive resolver). 2. TCP 3-Way Handshake (SYN, SYN-ACK, ACK). 3. TLS Handshake (certificate exchange, cipher negotiation, session key generation). 4. HTTP GET request sent over encrypted TLS. 5. Server responds with HTML/CSS/JS. 6. Browser renders DOM tree.',
    keyPoints: ['DNS Resolution → TCP Handshake → TLS Handshake → HTTP Request → Server Response → DOM Painting'],
  },
  {
    id: '4',
    category: 'System Design',
    question: 'What is the CAP Theorem and how do you choose between CP vs AP?',
    answer: 'In a distributed data store, you can only guarantee at most TWO out of three properties: Consistency (every read receives the most recent write or error), Availability (every non-failing node returns a response), and Partition Tolerance (system continues functioning despite network packet loss/partitions). Network partitions are inevitable, so real-world distributed systems choose CP (e.g. HBase, MongoDB) or AP (e.g. Cassandra, DynamoDB).',
    keyPoints: ['Partition Tolerance (P) is mandatory in distributed networks', 'CP = Strong consistency over availability', 'AP = High availability with eventual consistency'],
  },
  {
    id: '5',
    category: 'OOPs',
    question: 'Explain the 4 Core Pillars of Object-Oriented Programming.',
    answer: '1. Encapsulation: Bundling data and methods, hiding internal state via access modifiers. 2. Abstraction: Hiding implementation complexity behind clear public interfaces. 3. Inheritance: Reusing and extending base class behavior. 4. Polymorphism: Ability of objects to take multiple forms via method overriding (runtime) and method overloading (compile-time).',
    keyPoints: ['Encapsulation = Data hiding', 'Abstraction = Interface simplification', 'Inheritance = Code reuse', 'Polymorphism = Dynamic dispatch'],
  },
  {
    id: '6',
    category: 'Operating Systems',
    question: 'What are the 4 Necessary Conditions for Deadlock?',
    answer: 'Coffman Conditions: 1. Mutual Exclusion (at least one resource non-shareable). 2. Hold and Wait (process holds resource while requesting more). 3. No Preemption (resources cannot be forcibly taken). 4. Circular Wait (a closed chain of processes each waiting for a resource held by the next).',
    keyPoints: ['Mutual Exclusion', 'Hold & Wait', 'No Preemption', 'Circular Wait'],
  },
];

const CORE_CS_TOPICS = [
  {
    id: 'os',
    title: 'Operating Systems',
    icon: Cpu,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    summary: 'Process synchronization, memory management, virtual memory, paging, and disk scheduling.',
    items: [
      {
        topic: 'Paging & Virtual Memory',
        description: 'Translating logical to physical addresses using Page Tables and Translation Lookaside Buffer (TLB). Page faults trigger OS disk fetches.',
        interviewTip: 'Interviewers often ask about TLB miss overhead and inverted page tables in 64-bit systems.',
      },
      {
        topic: 'Process Synchronization & Semaphores',
        description: 'Mutex (binary lock for mutual exclusion) vs Counting Semaphores (signaling mechanism with wait/signal operations). Critical section problem.',
        interviewTip: 'Know the Producer-Consumer and Dining Philosophers concurrency solutions.',
      },
      {
        topic: 'CPU Scheduling Algorithms',
        description: 'FCFS, SJF (Shortest Job First), Round Robin (time quantum based), Multi-Level Feedback Queue (MLFQ).',
        interviewTip: 'Round Robin prevents starvation, while SJF gives optimal average waiting time.',
      },
    ],
  },
  {
    id: 'dbms',
    title: 'Database Management Systems',
    icon: Database,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    summary: 'SQL vs NoSQL, B+ Tree Indexing, Normalization (1NF to BCNF), and Transaction Isolation levels.',
    items: [
      {
        topic: 'Indexing & B+ Trees',
        description: 'B+ trees store data pointers only at leaf nodes, ensuring high fan-out, shallow height (typically 3-4 levels), and fast range-scan traversals.',
        interviewTip: 'Explain why Hash Indexes are O(1) for point lookups but fail completely for range queries (`WHERE age > 25`).',
      },
      {
        topic: 'Database Normalization',
        description: '1NF (atomic values), 2NF (remove partial dependencies on composite keys), 3NF (remove transitive dependencies), BCNF (every determinant is a candidate key).',
        interviewTip: 'In read-heavy analytics systems, deliberate de-normalization is often favored to avoid expensive table joins.',
      },
      {
        topic: 'Transaction Isolation Levels',
        description: 'Read Uncommitted (Dirty Reads), Read Committed (Non-repeatable reads prevented), Repeatable Read (Phantom reads possible), Serializable (Strict isolation).',
        interviewTip: 'PostgreSQL default is Read Committed; MySQL InnoDB default is Repeatable Read using MVCC.',
      },
    ],
  },
  {
    id: 'networks',
    title: 'Computer Networks',
    icon: Globe,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    summary: 'OSI 7-layer model, TCP/IP, WebSocket, HTTP/1.1 vs HTTP/2 vs HTTP/3, and Subnetting.',
    items: [
      {
        topic: 'TCP vs UDP Deep Dive',
        description: 'TCP: Connection-oriented, reliable, ordered byte stream, congestion control, windowing. UDP: Connectionless, unreliable, low latency for streaming/gaming.',
        interviewTip: 'Explain the 3-way handshake (SYN, SYN-ACK, ACK) and 4-way teardown (FIN, ACK, FIN, ACK).',
      },
      {
        topic: 'HTTP/2 & HTTP/3 Protocol Evolution',
        description: 'HTTP/1.1 introduced keep-alive. HTTP/2 introduced binary framing, multiplexing over single TCP connection, and header compression (HPACK). HTTP/3 uses QUIC over UDP to solve TCP head-of-line blocking.',
        interviewTip: 'Head-of-line blocking in HTTP/2 occurs if a single TCP packet is dropped, stalling all multiplexed streams.',
      },
      {
        topic: 'DNS & Anycast Routing',
        description: 'Hierarchical DNS tree (Root servers, TLD servers, Authoritative nameservers). Anycast routes user requests to the closest physical CDN edge server.',
        interviewTip: 'TTL (Time-to-Live) dictates DNS cache expiration and zero-downtime DNS migrations.',
      },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design Patterns',
    icon: Layers,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    summary: 'Scalability fundamentals, consistent hashing, message queues, distributed caching, and rate limiters.',
    items: [
      {
        topic: 'Consistent Hashing with Virtual Nodes',
        description: 'Distributes keys across a hash ring (0 to 2³² - 1). When nodes join or leave, only K/N keys need remapping rather than entire hash tables.',
        interviewTip: 'Virtual nodes prevent hot spots and ensure uniform load distribution across uneven server specs.',
      },
      {
        topic: 'Caching Strategies',
        description: 'Cache-Aside (Lazy loading), Write-Through (writes to cache and DB synchronously), Write-Back (writes to cache, writes to DB asynchronously). Eviction: LRU, LFU.',
        interviewTip: 'Be ready to discuss Cache Stampede / Thundering Herd and Cache Invalidation strategies.',
      },
      {
        topic: 'Message Queues & Event-Driven Architecture',
        description: 'Decoupling producers from consumers using Kafka (distributed commit log, partitions) or RabbitMQ (AMQP message broker, exchanges).',
        interviewTip: 'Explain at-least-once vs at-most-once vs exactly-once delivery guarantees.',
      },
    ],
  },
];

const BEHAVIORAL_FRAMEWORKS = [
  {
    category: 'STAR Framework',
    description: 'Structure every behavioral story clearly to showcase impact and ownership.',
    steps: [
      { step: 'Situation', text: 'Set the context. Briefly describe the company, project, timeline, and stakes.' },
      { step: 'Task', text: 'Define the specific challenge or objective YOU were responsible for solving.' },
      { step: 'Action', text: 'Detail the concrete engineering decisions, leadership, or technical trade-offs you executed.' },
      { step: 'Result', text: 'Quantify your outcome with metrics (e.g. reduced latency by 35%, saved 40 engineering hours/month).' },
    ],
  },
  {
    category: 'Top Technical Behavioral Questions',
    description: 'High-frequency scenarios asked in FAANG and Tier-1 engineering rounds.',
    questions: [
      {
        q: 'Tell me about a time you had a technical disagreement with a teammate.',
        guide: 'Focus on objective data, running benchmarks/POCs, respectful communication, and disagreeing and committing once a decision is made.',
      },
      {
        q: 'Describe a project failure or a production outage you caused.',
        guide: 'Own the mistake immediately. Explain how you mitigated the issue, conducted a blameless post-mortem, and implemented regression tests to prevent recurrence.',
      },
      {
        q: 'How do you handle tight deadlines with ambiguous requirements?',
        guide: 'Highlight asking clarifying questions, identifying MVP core vs non-essential features, communicating trade-offs to stakeholders, and shipping iteratively.',
      },
    ],
  },
];

export default function KnowledgeHubPage() {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('core-cs');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Flashcard State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardCategoryFilter, setCardCategoryFilter] = useState('ALL');
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  // Notes state
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; text: string; date: string }>>([
    {
      id: 'n1',
      text: 'Remember: In Redis, single-threaded event loop means operations are atomic. Use Pipelines for batch commands.',
      date: 'Aug 28, 2026',
    },
    {
      id: 'n2',
      text: 'B+ tree leaf nodes are linked as a doubly-linked list for fast range traversals (e.g. BETWEEN queries).',
      date: 'Aug 29, 2026',
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNote = () => {
    if (!notes.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      text: notes.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setSavedNotes([newNote, ...savedNotes]);
    setNotes('');
  };

  const filteredFlashcards = FLASHCARDS.filter((card) => {
    const matchCat = cardCategoryFilter === 'ALL' || card.category === cardCategoryFilter;
    const matchSearch =
      !searchQuery ||
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCard = filteredFlashcards[currentCardIndex] || filteredFlashcards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % Math.max(1, filteredFlashcards.length));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + filteredFlashcards.length) % Math.max(1, filteredFlashcards.length));
  };

  const toggleMastered = (id: string) => {
    setMasteredCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 font-sans">
      {/* Header Banner */}
      <PageHeader
        title="Knowledge Hub & Flashcards"
        description="Comprehensive revision cheat sheets, core CS fundamentals (OS, DBMS, Networks, OOPs), system design blueprints, and interactive interview flashcards."
        icon={BookOpen}
        iconClassName="text-indigo-400"
        gradientFrom="from-indigo-950/70"
        gradientVia="via-violet-950/45"
        gradientTo="to-slate-900/45"
        borderColor="border-indigo-500/20"
        glowColor="bg-indigo-500/15"
        secondaryGlowColor="bg-violet-500/10"
        actions={
          <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>High-Yield Revision Bank</span>
          </div>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex overflow-x-auto bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 w-full backdrop-blur-md no-scrollbar gap-1">
        {[
          { id: 'core-cs', label: 'Core CS Subjects', icon: Cpu },
          { id: 'flashcards', label: 'Flashcards Practice', icon: Lightbulb },
          { id: 'system-design', label: 'System Design Blueprints', icon: Layers },
          { id: 'behavioral', label: 'STAR Behavioral Guides', icon: MessageSquare },
          { id: 'my-notes', label: 'My Notes & Summary', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as KnowledgeTab);
                setIsFlipped(false);
              }}
              className={`flex-none px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Core CS Subjects */}
      {activeTab === 'core-cs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CORE_CS_TOPICS.map((domain) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5 backdrop-blur-md shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${domain.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{domain.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{domain.summary}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {domain.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-2 text-xs shadow-inner"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-200 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              {item.topic}
                            </h4>
                            <button
                              onClick={() => handleCopy(item.description + '\n\nTip: ' + item.interviewTip, `${domain.id}-${idx}`)}
                              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                              title="Copy summary"
                            >
                              {copiedId === `${domain.id}-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-slate-400 leading-relaxed">{item.description}</p>
                          <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span><strong>Interview Key:</strong> {item.interviewTip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Flashcards Practice */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'Operating Systems', 'DBMS', 'Computer Networks', 'System Design', 'OOPs'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCardCategoryFilter(cat);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    cardCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-500">
              Card {currentCardIndex + 1} of {filteredFlashcards.length}
            </span>
          </div>

          {activeCard ? (
            <div className="space-y-6">
              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="group relative cursor-pointer min-h-[320px] rounded-3xl p-8 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800 hover:border-indigo-500/40 shadow-2xl transition-all duration-300 flex flex-col justify-between backdrop-blur-xl"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-bold uppercase tracking-wider">
                    {activeCard.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-indigo-400" />
                      Click card to flip
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(activeCard.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        masteredCards[activeCard.id]
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                      }`}
                      title={masteredCards[activeCard.id] ? 'Mastered' : 'Mark as mastered'}
                    >
                      {masteredCards[activeCard.id] ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="my-6">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">Question</span>
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                        {activeCard.question}
                      </h3>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <span className="text-[11px] text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Explanation & Answer
                      </span>
                      <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                        {activeCard.answer}
                      </p>
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Key Points</span>
                        <ul className="space-y-1 text-xs text-indigo-300 list-disc list-inside">
                          {activeCard.keyPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Indicator */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80">
                  <span>{isFlipped ? 'Answer Revealed' : 'Prompt View'}</span>
                  <span className="font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    Flip for details →
                  </span>
                </div>
              </div>

              {/* Card Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevCard}
                  className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  ← Previous Card
                </button>

                <button
                  onClick={() => toggleMastered(activeCard.id)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                    masteredCards[activeCard.id]
                      ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {masteredCards[activeCard.id] ? 'Mastered ✓' : 'Mark Mastered'}
                </button>

                <button
                  onClick={handleNextCard}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-900/30 active:scale-95"
                >
                  Next Card →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
              No flashcards match your filter criteria.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Design Blueprints */}
      {activeTab === 'system-design' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                1. Scalability Fundamentals
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vertical Scaling (Bigger instances) vs Horizontal Scaling (Distributed stateless fleets behind Load Balancers like NGINX / AWS ALB).
              </p>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                <li>Stateless servers store session tokens in distributed Redis.</li>
                <li>Database read replicas offload analytical queries from primary master.</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                2. Storage & Sharding
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Horizontal partitioning splits data across database shards based on a Shard Key (e.g. `user_id % num_shards`).
              </p>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                <li>Choose high-cardinality shard keys to avoid hot-spot partitions.</li>
                <li>Consistent Hashing handles dynamic cluster node additions without full reshuffling.</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-fuchsia-400" />
                3. Rate Limiting Algorithms
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Protect downstream services from DDoS and abuse using Token Bucket, Leaky Bucket, and Sliding Window Logs.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                <li>Token Bucket allows bursts while capping continuous rate.</li>
                <li>Redis atomic Lua scripts implement distributed sliding window counters.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: STAR Behavioral Guides */}
      {activeTab === 'behavioral' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {BEHAVIORAL_FRAMEWORKS.map((frame, i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5 backdrop-blur-md shadow-xl"
              >
                <div>
                  <h3 className="text-base font-bold text-white">{frame.category}</h3>
                  <p className="text-xs text-slate-400 mt-1">{frame.description}</p>
                </div>

                {frame.steps && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {frame.steps.map((st) => (
                      <div key={st.step} className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-1.5 shadow-inner">
                        <span className="text-xs font-mono font-bold text-violet-400">{st.step}</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{st.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {frame.questions && (
                  <div className="space-y-3 pt-1">
                    {frame.questions.map((q, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2 shadow-inner">
                        <h4 className="text-xs font-bold text-slate-200">
                          {idx + 1}. &quot;{q.q}&quot;
                        </h4>
                        <p className="text-xs text-indigo-300/90 leading-relaxed pl-2 border-l-2 border-indigo-500/40">
                          <strong>Ideal Framing:</strong> {q.guide}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: My Notes & Summary */}
      {activeTab === 'my-notes' && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Quick Revision Scratchpad
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down interview shortcuts, tricky edge cases, or revision tips here..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 resize-none shadow-inner"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddNote}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg"
              >
                Save Note
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Saved Revision Logs ({savedNotes.length})</h4>
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start justify-between gap-4 backdrop-blur-md shadow-sm"
              >
                <div className="space-y-1 text-xs">
                  <p className="text-slate-200 leading-relaxed">{note.text}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{note.date}</span>
                </div>
                <button
                  onClick={() => setSavedNotes(savedNotes.filter((n) => n.id !== note.id))}
                  className="text-slate-500 hover:text-rose-400 text-xs font-bold shrink-0 p-1"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
