class apiError extends Error {
  constructor(statuscode, message, error = [], stack = "") {
    super(message);
    (statuscode = this.statuscode),
      (message = this.message),
      (error = this.error),
      (data = null),
      (success = false);

    if (stack) {
      stack = this.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
