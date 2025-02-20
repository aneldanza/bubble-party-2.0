class Observer<T> {
  private observers: Function[] = [];
  private _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  // Getter for the observed variable
  get value(): T {
    return this._value;
  }

  // Setter for the observed variable
  set value(newValue: T) {
    if (newValue !== this._value) {
      this._value = newValue;
      this.notify(newValue);
    }
  }

  // Subscribe to changes
  subscribe(fn: (value: T) => void) {
    this.observers.push(fn);
  }

  // Unsubscribe from changes
  unsubscribe(fn: (value: T) => void) {
    this.observers = this.observers.filter((subscriber) => subscriber !== fn);
  }

  // Notify all observers of a change
  private notify(data: T) {
    this.observers.forEach((observer) => observer(data));
  }
}

export default Observer;
