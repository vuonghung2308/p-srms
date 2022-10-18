export const success = (data = null) => {
    if (data !== null) {
        return JSON.stringify({
            status: "SUCCESS", data
        });
    } else {
        return JSON.stringify({
            status: "SUCCESS"
        });
    }
}

export const failed = (error) => {
    return JSON.stringify({
        status: "FAILED", error,
        timestamp: new Date().toISOString()
    });
};