/**
 * Global API Helper with timeout, retry, and loading states
 * Handles backend wake-up delays and network issues
 */

class APIHelper {
  constructor() {
    // Auto-detect backend URL
    this.baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000'
      : 'https://your-backend-name.onrender.com'; // BAAD ME UPDATE KARENGE
    
    this.isBackendAwake = false;
    this.wakeupAttempted = false;
  }

  /**
   * Check if backend is awake (with timeout)
   */
  async checkBackendHealth(timeout = 5000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseURL}/api/health`, {
        signal: controller.signal,
        method: 'GET'
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.isBackendAwake = true;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wake up backend before critical operations
   */
  async wakeupBackend(onProgress) {
    if (this.isBackendAwake || this.wakeupAttempted) {
      return true;
    }

    this.wakeupAttempted = true;

    if (onProgress) onProgress('Connecting to server...');

    // Try health check first (quick)
    const isHealthy = await this.checkBackendHealth(3000);
    if (isHealthy) {
      if (onProgress) onProgress('Connected!');
      return true;
    }

    // Backend is sleeping, inform user
    if (onProgress) onProgress('⏰ Waking up server, please wait 30-60 seconds...');

    // Ping health endpoint to wake it up
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 12; // 12 attempts × 5 sec = 60 seconds max

    while (attempts < maxAttempts) {
      attempts++;
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (onProgress) {
        onProgress(`⏰ Waking up server... ${elapsed}s elapsed`);
      }

      const isAwake = await this.checkBackendHealth(5000);
      if (isAwake) {
        if (onProgress) onProgress('✅ Server ready!');
        return true;
      }

      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Failed to wake up after 60 seconds
    if (onProgress) {
      onProgress('❌ Server not responding. Please try again later.');
    }
    return false;
  }

  /**
   * Make API call with automatic retry and timeout handling
   */
  async request(url, options = {}, criticalOperation = false) {
    const {
      timeout = 30000, // 30 seconds default
      retries = 3,
      onProgress = null,
      ...fetchOptions
    } = options;

    // For critical operations (payments), ensure backend is awake first
    if (criticalOperation && !this.isBackendAwake) {
      const awake = await this.wakeupBackend(onProgress);
      if (!awake) {
        throw new Error('Server not responding. Please try again later.');
      }
    }

    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          credentials: 'include'
        });

        clearTimeout(timeoutId);

        // If successful, mark backend as awake
        if (response.ok) {
          this.isBackendAwake = true;
        }

        return response;

      } catch (error) {
        lastError = error;

        // If aborted (timeout), don't retry on last attempt
        if (error.name === 'AbortError') {
          if (attempt === retries) {
            throw new Error('Request timed out. Server might be sleeping. Please try again.');
          }
          // Wait before retry
          if (onProgress) {
            onProgress(`Retrying... (attempt ${attempt + 1}/${retries})`);
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        // Network error
        if (attempt === retries) {
          throw new Error('Network error. Please check your connection.');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError;
  }

  /**
   * Convenient methods
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Create global instance
window.api = new APIHelper();