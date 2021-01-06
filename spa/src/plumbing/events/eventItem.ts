/*
 * A simple event
 */
export interface EventItem {
    name: string;
    callbacks: ((data: any) => void)[];
}
