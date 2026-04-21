import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh }: { onRefresh: () => Promise<void> }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [-100, 0], [100, 0]);
  const opacity = useTransform(scrollY, [-100, -50], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < -80 && !isRefreshing) {
        setIsRefreshing(true);
        onRefresh().finally(() => setIsRefreshing(false));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRefreshing, onRefresh]);

  return (
    <motion.div 
      style={{ y, opacity }}
      className="absolute top-0 left-0 right-0 flex justify-center py-4 z-0 pointer-events-none"
    >
      <motion.div
        animate={isRefreshing ? { rotate: 360 } : {}}
        transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
        className="text-brand-primary"
      >
        <RefreshCw size={24} />
      </motion.div>
    </motion.div>
  );
};

export default PullToRefresh;
