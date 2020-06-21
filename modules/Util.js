export async function sleep(milis) {
    return new Promise(resolve => setTimeout(resolve, milis));
}

export class EventEmitter {
    constructor() {
        this.events = {};
    }
    existEvent(type) {
        return typeof this.events[type] === 'object';
    }
    on(type, listener) {
        if (!this.existEvent(type)) {
            this.events[type] = [];
        }
        this.events[type].push(listener);
        return () => this.removeListener(type, listener);
    }
    removeListener(type, listener) {
        if (!this.existEvent(type)) return;

        const idx = this.events[type].indexOf(listener);
        if (idx > -1) {
            this.events[type].splice(idx, 1);
        }
    }
    emit(type, ...args) {
        if (!this.existEvent(type)) return;
        this.events[type].forEach(listener => listener(...args));
    }
}