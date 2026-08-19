import { ChangeEvent } from 'react';
export declare const useForm: <T>(initialState: T) => {
    formState: T;
    handleChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormState: import("react").Dispatch<import("react").SetStateAction<T>>;
};
//# sourceMappingURL=useForm.d.ts.map