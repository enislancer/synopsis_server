export default function calcBusinessDays(dDate1, dDate2) {
    if (dDate1 > dDate2) return 0;
    var date = dDate1;
    var dates = [];

    while (date < dDate2) {
        if (date.getDay() === 0 || date.getDay() === 7) dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}