// small helper to return date ranges
export function getRangeForKey(key, customFrom, customTo) {
  const now = new Date();
  let from = new Date();
  let to = new Date();

  switch (key) {
    case "24h":
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      to = now;
      break;
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      from = new Date(yesterday.setHours(0, 0, 0, 0));
      to = new Date(yesterday.setHours(23, 59, 59, 999));
      break;
    }
    case "7d":
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      to = now;
      break;
    case "30d":
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      to = now;
      break;
    case "1y":
      from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      to = now;
      break;
    case "custom":
      if (!customFrom || !customTo) return null;
      from = new Date(customFrom);
      to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
      break;
    default:
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      to = now;
  }

  return { from, to };
}
