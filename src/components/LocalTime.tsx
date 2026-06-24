"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function LocalTime({ date, formatStr = "HH:mm" }: { date: string | Date, formatStr?: string }) {
    const [formatted, setFormatted] = useState("");

    useEffect(() => {
        setFormatted(format(new Date(date), formatStr));
    }, [date, formatStr]);

    if (!formatted) {
        // Return a placeholder that matches the expected size, or nothing
        return <span className="opacity-0">--:--</span>;
    }

    return <>{formatted}</>;
}
