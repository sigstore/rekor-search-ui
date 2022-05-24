import moment from "moment";

export function toRelativeDateString(date: Date) {
	return `${moment().to(date)} (${moment(date).format()})`;
}
