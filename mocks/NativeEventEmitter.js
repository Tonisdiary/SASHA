// Mock implementation of NativeEventEmitter for web
import { EventEmitter } from 'events';

export default class NativeEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.listeners = {};
  }

  addListener(eventType, listener, context) {
    const subscription = super.addListener(eventType, listener);
    this.listeners[eventType] = this.listeners[eventType] || [];
    this.listeners[eventType].push(subscription);
    return {
      remove: () => {
        subscription.removeListener();
        const index = this.listeners[eventType].indexOf(subscription);
        if (index !== -1) {
          this.listeners[eventType].splice(index, 1);
        }
      }
    };
  }

  removeAllListeners(eventType) {
    if (eventType && this.listeners[eventType]) {
      this.listeners[eventType].forEach(subscription => subscription.removeListener());
      delete this.listeners[eventType];
    } else {
      Object.keys(this.listeners).forEach(type => {
        this.listeners[type].forEach(subscription => subscription.removeListener());
      });
      this.listeners = {};
    }
  }

  emit(eventType, ...params) {
    super.emit(eventType, ...params);
  }
}

// Export a singleton instance
module.exports = NativeEventEmitter;