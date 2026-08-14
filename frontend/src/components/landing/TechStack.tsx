'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Layers } from 'lucide-react';

const stack = [
  {
    category: 'Frontend',
    items: [
      { name: 'Next.js 15', detail: 'App Router · React 19 · Server Components' },
      { name: 'Tailwind CSS', detail: 'Utility-first styling · Custom design tokens' },
      { name: 'Framer Motion', detail: 'Physics-based animations · Scroll triggers' },
      { name: 'Socket.IO Client', detail: 'Real-time session streaming' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'NestJS 10', detail: 'Modular architecture · Guards · Interceptors' },
      { name: 'Prisma 5', detail: 'Type-safe ORM · Auto migrations' },
      { name: 'PostgreSQL 16', detail: 'Neon Cloud · pgvector · Full audit trail' },
      { name: 'Redis 7', detail: 'Session cache · Pub/Sub · Rate limiting' },
    ],
  },
  {
    category: 'ML / AI',
    items: [
      { name: 'FastAPI', detail: 'Python inference server · async/await' },
      { name: 'scikit-learn', detail: 'IsolationForest · 100 estimators' },
      { name: 'NumPy / Pandas', detail: 'Feature engineering · Vector math' },
      { name: 'Nodemailer', detail: 'Gmail SMTP · Step-up OTP delivery' },
    ],
  },
];

function StackColumn({ group, groupIndex }: { group: typeof stack[0]; groupIndex: number }) {
  const colRef = useRef<HTMLDivElement>(null);
  const colInView = useInView(colRef, { once: true, margin: '-60px' });

  // Each column rises from a different height with spring physics
  const riseDistances = [80, 50, 100];

  return (
    <motion.div
      ref={colRef}
      initial={{
        opacity: 0,
        y: riseDistances[groupIndex] || 60,
        rotateX: 8,
      }}
      animate={
        colInView
          ? { opacity: 1, y: 0, rotateX: 0 }
          : {}
      }
      transition={{
        duration: 0.7,
        delay: groupIndex * 0.12,
        ease: [0.34, 1.56, 0.64, 1], // spring-like overshoot
      }}
      className="py-1"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Category label with underline draw */}
      <div className="relative mb-4 pb-2">
        <motion.div
          className="text-[10px] font-normal text-zinc-400 tracking-widest uppercase font-mono"
          initial={{ opacity: 0, x: -12 }}
          animate={colInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: groupIndex * 0.12 + 0.1 }}
        >
          {group.category}
        </motion.div>
        {/* Animated underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-zinc-200 origin-left"
          initial={{ scaleX: 0 }}
          animate={colInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: groupIndex * 0.12 + 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Stack items with typewriter-style staggered fade from left */}
      <div className="space-y-4 font-normal">
        {group.items.map((item, ii) => (
          <motion.div
            key={ii}
            initial={{ opacity: 0, x: -20, filter: 'blur(2px)' }}
            animate={colInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{
              duration: 0.45,
              delay: groupIndex * 0.12 + 0.2 + ii * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              x: 4,
              transition: { duration: 0.15 },
            }}
            className="group cursor-default"
          >
            {/* Main Item Name in Cursive Font */}
            <div className="font-serif-italic italic text-zinc-800 text-[17px] sm:text-[18px] font-normal leading-snug group-hover:text-zinc-900 transition-colors">
              {item.name}
            </div>
            {/* Standard Sans Description below */}
            <div className="text-[12px] text-zinc-500 font-light mt-0.5 group-hover:text-zinc-600 transition-colors">
              {item.detail}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function TechStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="stack" ref={sectionRef} className="relative min-h-[85vh] flex flex-col justify-center py-16 md:py-24 bg-white text-zinc-800">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12" style={{ perspective: '800px' }}>
        {/* Header grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20, rotateX: 10 }}
            animate={titleInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[10px] font-normal text-zinc-400 tracking-widest uppercase mb-2 font-mono">
              ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-[32px] font-light text-zinc-800 tracking-tight leading-snug">
              Built on a modern{' '}
              <motion.span
                className="font-serif-italic italic text-zinc-600 font-light inline-block"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={titleInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                production stack
              </motion.span>
            </h2>
          </motion.div>

          {/* Borderless Thinner Cursive Editorial Paragraph */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20, rotateX: 10 }}
            animate={titleInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center space-x-2 text-zinc-400 mb-1.5 font-mono text-[10px] font-normal uppercase tracking-wider">
              <motion.div
                animate={titleInView ? { rotate: [0, -15, 15, 0] } : {}}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              >
                <Layers className="w-3.5 h-3.5" />
              </motion.div>
              <span>STACK HIGHLIGHT</span>
            </div>
            <p className="font-serif-italic italic text-zinc-600 text-[15px] sm:text-[16.5px] leading-relaxed font-light">
              &ldquo;Engineered with modern type-safety and high-throughput concurrency across Next.js 15, NestJS 10, FastAPI, and Neon PostgreSQL.&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Stack columns with spring rise from different heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          {stack.map((group, gi) => (
            <StackColumn key={gi} group={group} groupIndex={gi} />
          ))}
        </div>
      </div>
    </section>
  );
}
