import { useEffect, useState } from "react";

export function useThrottle<T>(value: T, delay: number): T {
    const [throttled, setThrottled] = useState(value);

    useEffect(() => {
        const  handler = setTimeout(() => {
            setThrottled(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return throttled;
}