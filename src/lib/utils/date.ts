export function timeFromNow(date: string | Date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return [0, "timeAgo.justNow"];
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return [diffInMinutes, diffInMinutes === 1 ? "timeAgo.min" : "timeAgo.mins"];
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return [diffInHours, diffInHours === 1 ? "timeAgo.hour" : "timeAgo.hours"];
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return [diffInDays, diffInDays === 1 ? "timeAgo.day" : "timeAgo.days"];
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return [diffInWeeks, diffInWeeks === 1 ? "timeAgo.week" : "timeAgo.weeks"];
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return [diffInMonths, diffInMonths === 1 ? "timeAgo.month" : "timeAgo.months"];
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return [diffInYears, diffInYears === 1 ? "timeAgo.year" : "timeAgo.years"];
}
