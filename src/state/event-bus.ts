export class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  async emitAsync(event: string, data: any): Promise<void> {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      await Promise.all(
        Array.from(callbacks).map(callback =>
          Promise.resolve().then(() => callback(data)).catch(error => {
            console.error(`Error in event handler for ${event}:`, error);
          })
        )
      );
    }
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
