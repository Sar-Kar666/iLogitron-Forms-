
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';

// Generic Autosave Hook
export function useAutosave<T>(
    data: T,
    onSave: (data: T) => Promise<unknown>,
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

    const executeSave = useCallback(async (currentData: T) => {
        try {
            setSaveStatus('saving');
            await latestOnSave.current(currentData);
            setSaveStatus('saved');
            setLastSavedAt(new Date());
        } catch (error) {
            console.error("Autosave failed", error);
            setSaveStatus('error');
        }
    }, []);

    const debouncedSave = useMemo(
        () => debounce(executeSave, delay),
        [executeSave, delay]
    );

    useEffect(() => {
        // Trigger save when data changes
        debouncedSave(data);

        // Cancel on unmount
        return () => {
            debouncedSave.cancel();
        };
    }, [data, debouncedSave]);

    return { saveStatus, lastSavedAt };
}
