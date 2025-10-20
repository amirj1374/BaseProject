/**
 * Performance monitoring and optimization configuration
 */

export const PERFORMANCE_CONFIG = {
  // Bundle analysis
  bundle: {
    enabled: process.env.NODE_ENV === 'development',
    threshold: {
      warning: 500 * 1024, // 500KB
      error: 1024 * 1024, // 1MB
    }
  },

  // Performance monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    metrics: {
      // Core Web Vitals
      LCP: { threshold: 2500 }, // Largest Contentful Paint
      FID: { threshold: 100 }, // First Input Delay
      CLS: { threshold: 0.1 }, // Cumulative Layout Shift
      FCP: { threshold: 1800 }, // First Contentful Paint
      TTFB: { threshold: 800 }, // Time to First Byte
    }
  },

  // Asset optimization
  assets: {
    images: {
      maxSize: 500 * 1024, // 500KB
      formats: ['webp', 'avif', 'jpeg'],
      quality: 85
    },
    fonts: {
      preload: ['vazir', 'yekan'],
      subset: true,
      formats: ['woff2', 'woff']
    }
  },

  // Caching strategies
  cache: {
    static: {
      maxAge: 31536000, // 1 year
      immutable: true
    },
    dynamic: {
      maxAge: 3600, // 1 hour
      staleWhileRevalidate: 86400 // 1 day
    }
  },

  // Code splitting
  splitting: {
    vendor: true,
    features: true,
    routes: true,
    components: {
      threshold: 50 * 1024 // 50KB
    }
  }
};

/**
 * Performance utilities
 */
export const performanceUtils = {
  /**
   * Measure performance of a function
   */
  measure<T>(name: string, fn: () => T): T {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

/**
 * Performance monitoring hooks
 */
export const usePerformance = () => {
  const measureRender = (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      return () => {
        const end = performance.now();
        console.log(`🎨 ${componentName} render: ${(end - start).toFixed(2)}ms`);
      };
    }
    return () => {};
  };

  const measureApiCall = (endpoint: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`🌐 ${endpoint}: ${(end - start).toFixed(2)}ms`);
      }
    };
  };

  return {
    measureRender,
    measureApiCall
  };
};
