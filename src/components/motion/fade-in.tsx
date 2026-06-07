"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

const fadeEase = [0.22, 1, 0.36, 1] as const;

const fadeInVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

type FadePresenceProps = {
  presenceKey: string;
  children: React.ReactNode;
  className?: string;
};

export function FadePresence({
  presenceKey,
  children,
  className,
}: FadePresenceProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: fadeEase };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={presenceKey}
        className={className}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
