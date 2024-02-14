import './bootstrap'
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import * as express from "express";
import { SomeService } from './service';

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

const someService = new SomeService()

// All your controllers should live here
app.get("/", function rootHandler(req, res) {
  res.json({
    status: 'ok',
  });
});

app.get("/user/1", function rootHandler(req, res) {
  res.json(someService.getUser());
});

app.get("/user/2", function rootHandler(req, res) {
  res.json(someService.getUserWithError());
});

app.get("/user/3", function rootHandler(req, res) {
  res.json(someService.otherError());
});

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// // Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(3000);