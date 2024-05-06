export function sendToElectron(channel, args) {
    if (typeof window !== 'undefined') {
        window.electronAPI.send(channel, args);
    }
}

export function removeAllListeners(channel) {
    if (typeof window !== 'undefined') {
        if (channel) {
            window.electronAPI.removeAllListeners(channel);
        } else {
            window.electronAPI.removeAllListeners();
        }
    }
}

export function listenOn(channel, callback) {
    if (typeof window !== 'undefined') {
        window.electronAPI.on(channel, callback);
    }
}
