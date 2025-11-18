export const TimeSpent = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const context = args[2];
    const logger = context?.req?.log || console;

    const startTime = process.hrtime();

    try {
      const result = await originalMethod.apply(this, args);

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const milliseconds = seconds * 1000 + nanoseconds / 1e6;

      logger.info(`[TimeSpent] Method '${propertyKey}' executed in ${milliseconds.toFixed(3)}ms`);

      return result;
    } catch (error: any) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const milliseconds = seconds * 1000 + nanoseconds / 1e6;

      logger.error({
        msg: `[TimeSpent] ❌ Method '${propertyKey}' failed after ${milliseconds.toFixed(3)}ms`,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  };

  return descriptor;
};
