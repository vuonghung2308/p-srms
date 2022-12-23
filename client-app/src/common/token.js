import { createContext, useReducer } from "react"

export const PayloadContext = createContext(null);
export const PayloadDispatchContext = createContext(null);

export const getPayload = () => {
    const strPayload = localStorage.getItem('user-payload');
    if (strPayload) {
        return JSON.parse(strPayload);
    } else {
        return { type: null };
    }
}

const savePayload = (payload) => {
    if (payload) {
        localStorage.setItem(
            'user-payload',
            JSON.stringify(payload)
        );
    }
}

const removePayload = () => {
    localStorage.removeItem('user-payload');
}

const payloadReducer = (_payload, action) => {
    switch (action.type) {
        case 'delete': {
            removePayload();
            return { type: null };
        }
        case 'save': {
            savePayload(action.payload);
            return { ...action.payload };
        }
        default: {
            throw new Error(`Unknown action: ${action.type}`)
        }
    }

}


export default function PayloadProvider({ children }) {
    const initialPayload = getPayload();

    const [payload, dispatch] = useReducer(
        payloadReducer, initialPayload,
    );

    return (
        <PayloadContext.Provider value={payload}>
            <PayloadDispatchContext.Provider value={dispatch}>
                {children}
            </PayloadDispatchContext.Provider>
        </PayloadContext.Provider>
    )
}