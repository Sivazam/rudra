import { globalLoaderManager } from '@/hooks/useGlobalLoader';

// Enhanced fetch function with automatic loading management
export async function fetchWithLoader<T>(
  url: string,
  options?: RequestInit,
  loadingSource = 'api'
): Promise<T> {
  return globalLoaderManager.withLoader(
    fetch(url, options).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }),
    loadingSource
  );
}

// Hook for API calls with automatic loading management
export function useApiWithLoader() {
  const get = async <T>(url: string): Promise<T> => {
    return globalLoaderManager.withLoader(
      fetch(url).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }),
      'api'
    );
  };

  const post = async <T>(url: string, data?: any): Promise<T> => {
    return globalLoaderManager.withLoader(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }),
      'api'
    );
  };

  const put = async <T>(url: string, data?: any): Promise<T> => {
    return globalLoaderManager.withLoader(
      fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }),
      'api'
    );
  };

  const del = async <T>(url: string): Promise<T> => {
    return globalLoaderManager.withLoader(
      fetch(url, {
        method: 'DELETE',
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }),
      'api'
    );
  };

  return { get, post, put, delete: del };
}