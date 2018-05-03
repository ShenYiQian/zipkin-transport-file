import {Logger, model} from "zipkin";

declare class FileLogger implements Logger {
  constructor(options: {filePath?: string});
  logSpan(span: model.Span): void;
}
export {FileLogger}
