export default function iterate(
    start: number,
    end: number,
    fn: (value: number) => unknown,
    options: {
        inclusive?: boolean,
        step?: number
    } = {
        inclusive: false,
        step: 1
    }
) {
    const _order = Math.sign(options.step ?? 1);
    const _end = end + (options.inclusive ? _order : 0);
    const _step = options.step ?? _order;

    console.log({ start, end, options, _order, _end, _step });

    if(
        (_order === 1 && start >= _end) ||
        (_order === -1 && start <= _end) ||
        (_step === 0)
    ) throw new Error("Trying to make an infinite loop");

    for(let i = start; i < _end; i += _step) fn(i);
}