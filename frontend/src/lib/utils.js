export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-us", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

export function formatMessageDateTime(date){
    return new Date(date).toLocaleDateString("en-us", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}