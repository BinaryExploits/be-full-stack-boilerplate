export enum LogLevel {
  None = 0,
  Info = 1 << 0,
  Warn = 1 << 1,
  Debug = 1 << 2,
  Error = 1 << 3,
  Trace = 1 << 4,
  Critical = 1 << 5,
  All = Info | Warn | Debug | Error | Trace | Critical,
}
