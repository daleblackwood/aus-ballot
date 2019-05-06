type ISubjectMethod<T> = (data: T) => void;

export interface ISubjectListener<T> {
    method: ISubjectMethod<T>;
    options: IListenerOptions;
}

export interface IListenerOptions {
    once?: boolean;
    immediate?: boolean;
}

export class Subject<T> {
    public value: T;
    protected listeners: Array<ISubjectListener<T>> = [];
    private dispatchTimer: any;

    constructor(initialValue: T) {
        this.value = initialValue;
    }

    public listen(method: (data: T) => void, options?: IListenerOptions): ISubjectListener<T> {
        options = {
            immediate: true,
            once: false,
            ...(options || {}),
        };
        this.unlisten(method);
        const listener = { method, options };
        this.listeners.push(listener);
        if (options.immediate) {
            method(this.value);
        }
        this.updateListeners();
        return listener;
    }

    public unlisten(methodOrListener: ISubjectMethod<T>|ISubjectListener<T>) {
        const index = this.listeners.findIndex(listener => (
            listener === methodOrListener || listener.method === methodOrListener
        ));
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
        this.updateListeners();
    }

    public setValue(data: T, forceUpdate = false) {
        if (forceUpdate === false && this.isValue(data)) {
            return;
        }
        this.value = data;
        clearTimeout(this.dispatchTimer);
        this.dispatchTimer = setTimeout(() => this.dispatch(), 10);
    }

    public dispatch() {
        for (const listener of this.listeners) {
            listener.method(this.value);
        }
        for (let i = this.listeners.length - 1; i >= 0; i--) {
            if (this.listeners[i].options.once === true) {
                this.listeners.slice(i, 1);
            }
        }
        this.updateListeners();
    }

    public isValue(data: T) {
        if (this.value === data) {
            return true;
        }
        if (this.value === null && data !== null) {
            return false;
        }
        if (typeof data === "object" && data !== null) {
            let isChanged = false;
            for (const key in data) {
                if (data[key] === this.value[key]) {
                    continue;
                }
                isChanged = true;
                break;
            }
            for (const key in this.value) {
                if (data[key] === this.value[key]) {
                    continue;
                }
                isChanged = true;
                break;
            }
            if (isChanged === false) {
                return true;
            }
        }
        return false;
    }

    protected updateListeners() {
        return;
    }

}

export interface ISubjectState<T> {
    value: T;
}
