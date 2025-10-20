/**
 * LCP (Largest Contentful Paint) Performance Optimizer
 * Provides utilities to monitor and optimize LCP performance
 */

interface LCPMetrics {
  value: number;
  element: Element | null;
  url: string;
  timestamp: number;
}

class LCPOptimizer {
  private observer: PerformanceObserver | null = null;
  private lcpValue: number = 0;
  private lcpElement: Element | null = null;

  constructor() {
    this.initializeObserver();
    this.optimizeCriticalResources();
  }

  private initializeObserver(): void {
    if (typeof window === 'undefined') return;

    // Observe LCP
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.lcpValue = lastEntry.startTime;
          this.lcpElement = lastEntry.element;
          
          this.reportLCP(lastEntry);
        });
        
        this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }

    // Fallback LCP measurement
    this.measureFallbackLCP();
  }

  private reportLCP(entry: any): void {
    const metrics: LCPMetrics = {
      value: entry.startTime,
      element: entry.element,
      url: window.location.href,
      timestamp: Date.now()
    };

    // Log LCP in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 LCP Performance:', {
        value: `${metrics.value.toFixed(2)}ms`,
        element: metrics.element?.tagName,
        rating: this.getLCPRating(metrics.value)
      });
    }

    // Report to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metrics);
    }
  }

  private getLCPRating(value: number): string {
    if (value <= 2500) return 'Good';
    if (value <= 4000) return 'Needs Improvement';
    return 'Poor';
  }

  private measureFallbackLCP(): void {
    // Fallback measurement for browsers without LCP support
    setTimeout(() => {
      const elements = document.querySelectorAll('img, video, canvas, svg, h1, h2, h3, h4, h5, h6, p, div');
      let largestElement: Element | null = null;
      let largestSize = 0;

      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const size = rect.width * rect.height;
        
        if (size > largestSize) {
          largestSize = size;
          largestElement = element;
        }
      });

      if (largestElement) {
        console.log('🔍 Fallback LCP Element:', largestElement);
      }
    }, 1000);
  }

  private optimizeCriticalResources(): void {
    // Preload critical images
    this.preloadCriticalImages();
    
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Defer non-critical resources
    this.deferNonCriticalResources();
  }

  private preloadCriticalImages(): void {
    // Find and preload critical images
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.getAttribute('src') || '';
      document.head.appendChild(link);
    });
  }

  private optimizeFontLoading(): void {
    // Ensure fonts are loaded with proper display strategy
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('✅ Fonts loaded');
      });
    }
  }

  private deferNonCriticalResources(): void {
    // Defer non-critical scripts
    const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
    nonCriticalScripts.forEach(script => {
      script.setAttribute('defer', 'true');
    });
  }

  private sendToAnalytics(metrics: LCPMetrics): void {
    // Send LCP data to your analytics service
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'web_vitals', {
        name: 'LCP',
        value: Math.round(metrics.value),
        event_category: 'Performance'
      });
    }
  }

  public getCurrentLCP(): number {
    return this.lcpValue;
  }

  public getLCPElement(): Element | null {
    return this.lcpElement;
  }

  public optimizeElement(element: Element): void {
    // Apply LCP optimizations to specific elements
    if (element instanceof HTMLImageElement) {
      element.loading = 'eager';
      element.fetchPriority = 'high';
    }
  }

  public preloadResource(url: string, type: 'image' | 'script' | 'style' | 'font'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = url;
    
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }
}

// Export singleton instance
export const lcpOptimizer = new LCPOptimizer();

// Export types
export type { LCPMetrics };

