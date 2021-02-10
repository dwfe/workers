export function log(...args) {
  const date = new Date();
  const isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  console.log(`[${isoDateTime}]`, ...args)
}

export const delayAsync = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})
