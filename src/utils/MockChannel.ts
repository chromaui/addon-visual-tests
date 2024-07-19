export class MockChannel {
  private listeners: Record<string, ((...args: any[]) => void)[]> = {};

  on(event: string, listener: (...args: any[]) => void) {
    this.listeners[event] = [...(this.listeners[event] ?? []), listener];
  }

  off(event: string, listener: (...args: any[]) => void) {
    this.listeners[event] = (this.listeners[event] ?? []).filter((l) => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    // setTimeout is used to simulate the asynchronous nature of the real channel
    (this.listeners[event] || []).forEach((listener) => setTimeout(() => listener(...args)));
  }
}
