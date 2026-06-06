// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ChangeEvent, useState } from 'react';

type FormState<T> = T;

export const useForm = <T>(initialState: T) => {
    const [formState, setFormState] = useState<FormState<T>>(initialState);

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value, type } = event.target;
        if (name.includes('.')) {
            const elements = name.split('.');
            const first = elements[0] as string;
            setFormState((prev) => ({
                ...prev,
                [elements[0]]: {
                    ...prev[first],
                    [elements[1]]: value,
                },
            }));
        } else {
            setFormState((prev) => ({
                ...prev,
                [name]: type == 'checkbox' ? is : type == 'date' ? new Date(value).toISOString() : value,
            }));
        }
    };

    return {
        formState,
        handleChange,
        setFormState
    };
};