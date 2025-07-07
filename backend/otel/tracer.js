const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { trace } = require('@opentelemetry/api');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');

// I'm setting up OpenTelemetry to track our feature flag usage
// Using console exporter since we're in dev mode - makes it easy to see what's happening
const sdk = new NodeSDK({
  serviceName: 'devflow',
  serviceVersion: '1.0.0',
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations({
    // I only want to instrument HTTP and Express for now
    '@opentelemetry/instrumentation-fs': {
      enabled: false,
    },
  })],
});

// Start the SDK before importing any other modules
sdk.start();

// I'm creating a tracer specifically for our feature flag operations
const tracer = trace.getTracer('devflow-flags', '1.0.0');

// Helper function to create spans for flag operations
// I like keeping this centralized so all my flag tracking looks consistent
function createFlagSpan(spanName, flagKey, attributes = {}) {
  return tracer.startSpan(spanName, {
    attributes: {
      'feature.flag.name': flagKey,
      'service.name': 'devflow',
      'env': 'dev', // hardcoded for now 
      ...attributes
    }
  });
}

module.exports = {
  tracer,
  createFlagSpan
};
