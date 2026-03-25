export const IST_TIME_ZONE = "Asia/Kolkata";

export function formatDateTimeIST(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }
) {
  try {
    return new Intl.DateTimeFormat("en-IN", { timeZone: IST_TIME_ZONE, ...opts }).format(new Date(iso));
  } catch {
    return iso;
  }
}

