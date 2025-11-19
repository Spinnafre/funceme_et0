export function truncateDecimal(value, places = 4) {
    return Math.trunc(value * Math.pow(10, places)) / Math.pow(10, places);
}