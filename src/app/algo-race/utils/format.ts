export const formatDuration = (ms: number) => {
  if (ms >= 1) return `${ms.toFixed(2)}ms`;
  const us = ms * 1000;
  if (us >= 1) return `${us.toFixed(2)}µs`;
  return `${(us * 1000).toFixed(0)}ns`;
};
