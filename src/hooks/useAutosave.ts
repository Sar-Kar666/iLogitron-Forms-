import { useState, useEffect, useRef, useCallback } from 'react';

// Generic Autosave Hook
export function useAutosave<T>(
    data: T,
    onSave: (data: T) => Promise<any>,
    delay: number = 1000
) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    const latestData = useRef(data);
    const latestOnSave = useRef(onSave);

    useEffect(() => {
        latestData.current = data;
    }, [data]);

    useEffect(() => {
        latestOnSave.current = onSave;
    }, [onSave]);

    useEffect(() => {
        // When data changes, we are technically "unsaved" or "pending".
        // We avoid setting state here to prevent strict mode warnings/renders, 
        // or we accept it. For now, let's just set timeout.

        const handler = setTimeout(async () => {
            try {
                setSaveStatus('saving');
                await latestOnSave.current(latestData.current);
                setSaveStatus('saved');
                setLastSavedAt(new Date());
            } catch (error) {
                console.error("Autosave failed", error);
                setSaveStatus('error');
            }
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [data, delay]);

    // Logic to prevent save on mount if needed, but here simple debounce is fine.

    return { saveStatus, lastSavedAt };
}
